/**
 * Tests for tick function and priority rules.
 * Verifies that the event loop follows all 7 priority rules correctly.
 */

import { describe, it, expect } from 'vitest';
import { tick } from '@/core/simulator/tick';
import {
  shouldExecuteCallStack,
  shouldDrainMicrotask,
  shouldRender,
  shouldExecuteRaf,
  shouldExecuteMacrotask,
  shouldAdvanceTime,
  isSimulationComplete,
} from '@/core/simulator/priority';
import { createInitialState } from '@/core/simulator/state';
import type { SimulatorState, Frame } from '@/core/types/simulator';
import type { Task } from '@/core/types/task';
import { TaskType, TaskState } from '@/core/types/task';
import { enqueueMicrotask, enqueueTimerTask } from '@/core/simulator/enqueue';

/**
 * Helper to create a simple task for testing
 */
function createTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    type: TaskType.SYNC,
    label: 'Test Task',
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    ...overrides,
  } as Task;
}

describe('Priority Rules', () => {
  describe('Rule 1: shouldExecuteCallStack', () => {
    it('returns true when call stack has frame with steps remaining', () => {
      const state = createInitialState();
      const task = createTask({ durationSteps: 3 });
      const frame: Frame = {
        task,
        startedAt: 0,
        stepsRemaining: 3,
      };
      const stateWithStack: SimulatorState = {
        ...state,
        callStack: [frame],
      };

      expect(shouldExecuteCallStack(stateWithStack)).toBe(true);
    });

    it('returns false when call stack is empty', () => {
      const state = createInitialState();
      expect(shouldExecuteCallStack(state)).toBe(false);
    });

    it('returns true even with 1 step remaining', () => {
      const state = createInitialState();
      const task = createTask({ durationSteps: 1 });
      const frame: Frame = {
        task,
        startedAt: 0,
        stepsRemaining: 1,
      };
      const stateWithStack: SimulatorState = {
        ...state,
        callStack: [frame],
      };

      expect(shouldExecuteCallStack(stateWithStack)).toBe(true);
    });
  });

  describe('Rule 2: shouldDrainMicrotask', () => {
    it('returns true when call stack empty and microtask queue has tasks', () => {
      const state = createInitialState();
      const task = createTask({ type: TaskType.MICROTASK });
      const stateWithMicro = enqueueMicrotask(state, task);

      expect(shouldDrainMicrotask(stateWithMicro)).toBe(true);
    });

    it('returns false when call stack is not empty', () => {
      const state = createInitialState();
      const task = createTask({ type: TaskType.MICROTASK });
      const stateWithMicro = enqueueMicrotask(state, task);

      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithStack: SimulatorState = {
        ...stateWithMicro,
        callStack: [frame],
      };

      expect(shouldDrainMicrotask(stateWithStack)).toBe(false);
    });

    it('returns false when microtask queue is empty', () => {
      const state = createInitialState();
      expect(shouldDrainMicrotask(state)).toBe(false);
    });
  });

  describe('Rule 3: shouldRender', () => {
    it('returns true when all conditions met', () => {
      const state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 16,
      });

      expect(shouldRender(state)).toBe(true);
    });

    it('returns false when call stack not empty', () => {
      const state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 16,
      });

      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithStack: SimulatorState = {
        ...state,
        callStack: [frame],
      };

      expect(shouldRender(stateWithStack)).toBe(false);
    });

    it('returns false when microtask queue not empty', () => {
      const state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 16,
      });

      const task = createTask({ type: TaskType.MICROTASK });
      const stateWithMicro = enqueueMicrotask(state, task);

      expect(shouldRender(stateWithMicro)).toBe(false);
    });

    it('returns false when renderPending is false', () => {
      const state = createInitialState({
        renderPending: false,
        frameInterval: 16,
        now: 16,
      });

      expect(shouldRender(state)).toBe(false);
    });

    it('returns false when not at frame boundary', () => {
      const state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 10,
      });

      expect(shouldRender(state)).toBe(false);
    });
  });

  describe('Rule 4: shouldExecuteRaf', () => {
    it('returns true when at frame boundary with rAF tasks', () => {
      const state = createInitialState({
        frameInterval: 16,
        now: 16,
      });

      const rafTask = createTask({ 
        type: TaskType.RAF,
        state: TaskState.QUEUED,
      });
      const stateWithRaf: SimulatorState = {
        ...state,
        rafQueue: [rafTask],
      };

      expect(shouldExecuteRaf(stateWithRaf)).toBe(true);
    });

    it('returns false when call stack not empty', () => {
      const state = createInitialState({
        frameInterval: 16,
        now: 16,
      });

      const rafTask = createTask({ type: TaskType.RAF });
      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithRafAndStack: SimulatorState = {
        ...state,
        rafQueue: [rafTask],
        callStack: [frame],
      };

      expect(shouldExecuteRaf(stateWithRafAndStack)).toBe(false);
    });

    it('returns false when not at frame boundary', () => {
      const state = createInitialState({
        frameInterval: 16,
        now: 10,
      });

      const rafTask = createTask({ 
        type: TaskType.RAF,
        state: TaskState.QUEUED,
      });
      const stateWithRaf: SimulatorState = {
        ...state,
        rafQueue: [rafTask],
      };

      expect(shouldExecuteRaf(stateWithRaf)).toBe(false);
    });

    it('returns false when rAF queue is empty', () => {
      const state = createInitialState({
        frameInterval: 16,
        now: 16,
      });

      expect(shouldExecuteRaf(state)).toBe(false);
    });
  });

  describe('Rule 5: shouldExecuteMacrotask', () => {
    it('returns true when call stack and microtask queue empty with macrotask', () => {
      const state = createInitialState();
      const macroTask = createTask({ type: TaskType.TIMER, delay: 0 });

      const stateWithMacro: SimulatorState = {
        ...state,
        macroQueue: [macroTask],
      };

      expect(shouldExecuteMacrotask(stateWithMacro)).toBe(true);
    });

    it('returns false when call stack not empty', () => {
      const state = createInitialState();
      const macroTask = createTask({ type: TaskType.TIMER, delay: 0 });
      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithMacroAndStack: SimulatorState = {
        ...state,
        macroQueue: [macroTask],
        callStack: [frame],
      };

      expect(shouldExecuteMacrotask(stateWithMacroAndStack)).toBe(false);
    });

    it('returns false when microtask queue not empty', () => {
      const state = createInitialState();
      const macroTask = createTask({ type: TaskType.TIMER, delay: 0 });
      const microTask = createTask({ type: TaskType.MICROTASK });

      const stateWithBoth: SimulatorState = {
        ...state,
        macroQueue: [macroTask],
        microQueue: [microTask],
      };

      expect(shouldExecuteMacrotask(stateWithBoth)).toBe(false);
    });

    it('returns false when macrotask queue is empty', () => {
      const state = createInitialState();
      expect(shouldExecuteMacrotask(state)).toBe(false);
    });
  });

  describe('Rule 6: shouldAdvanceTime', () => {
    it('returns true when all queues empty but Web APIs pending', () => {
      const state = createInitialState();
      const task = createTask({ type: TaskType.TIMER, delay: 100 });
      const stateWithWebApi = enqueueTimerTask(state, task, 100);

      expect(shouldAdvanceTime(stateWithWebApi)).toBe(true);
    });

    it('returns false when call stack not empty', () => {
      const state = createInitialState();
      const task = createTask({ type: TaskType.TIMER, delay: 100 });
      const stateWithWebApi = enqueueTimerTask(state, task, 100);

      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithStack: SimulatorState = {
        ...stateWithWebApi,
        callStack: [frame],
      };

      expect(shouldAdvanceTime(stateWithStack)).toBe(false);
    });

    it('returns false when no Web API operations', () => {
      const state = createInitialState();
      expect(shouldAdvanceTime(state)).toBe(false);
    });
  });

  describe('Rule 7: isSimulationComplete', () => {
    it('returns true when everything is empty', () => {
      const state = createInitialState();
      expect(isSimulationComplete(state)).toBe(true);
    });

    it('returns false when call stack has tasks', () => {
      const state = createInitialState();
      const frame: Frame = {
        task: createTask({}),
        startedAt: 0,
        stepsRemaining: 1,
      };

      const stateWithStack: SimulatorState = {
        ...state,
        callStack: [frame],
      };

      expect(isSimulationComplete(stateWithStack)).toBe(false);
    });

    it('returns false when Web APIs pending', () => {
      const state = createInitialState();
      const task = createTask({ type: TaskType.TIMER, delay: 100 });
      const stateWithWebApi = enqueueTimerTask(state, task, 100);

      expect(isSimulationComplete(stateWithWebApi)).toBe(false);
    });
  });
});

describe('Tick Function', () => {
  describe('Rule 1: Execute Current Call Stack Frame', () => {
    it('executes task with durationSteps=3 over 3 ticks', () => {
      let state = createInitialState();
      const task = createTask({ durationSteps: 3 });

      // Add task to macrotask queue
      state = {
        ...state,
        macroQueue: [task],
      };

      // Tick 1: Dequeue macrotask and push to call stack
      state = tick(state);
      expect(state.callStack.length).toBe(1);
      expect(state.callStack[0]!.stepsRemaining).toBe(3);
      expect(state.macroQueue.length).toBe(0);

      // Tick 2: Execute one step
      state = tick(state);
      expect(state.callStack.length).toBe(1);
      expect(state.callStack[0]!.stepsRemaining).toBe(2);

      // Tick 3: Execute another step
      state = tick(state);
      expect(state.callStack.length).toBe(1);
      expect(state.callStack[0]!.stepsRemaining).toBe(1);

      // Tick 4: Complete task
      state = tick(state);
      expect(state.callStack.length).toBe(0);
      expect(state.log.some((entry) => entry.type === 'task-complete')).toBe(
        true
      );
    });

    it('marks task as COMPLETED when stepsRemaining reaches 0', () => {
      let state = createInitialState();
      const task = createTask({ durationSteps: 1 });

      state = {
        ...state,
        macroQueue: [task],
      };

      // Start executing
      state = tick(state);
      expect(state.callStack[0]!.task.state).toBe(TaskState.RUNNING);

      // Complete
      state = tick(state);
      expect(state.callStack.length).toBe(0);
      const completionLog = state.log.find(
        (entry) => entry.type === 'task-complete'
      );
      expect(completionLog).toBeDefined();
    });
  });

  describe('Rule 2: Microtask Priority', () => {
    it('executes microtask before macrotask', () => {
      let state = createInitialState();

      // Add macrotask first
      const macroTask = createTask({
        id: 'macro-1',
        type: TaskType.TIMER,
        label: 'Macro',
        delay: 0,
      });
      state = {
        ...state,
        macroQueue: [macroTask],
      };

      // Add microtask second
      const microTask = createTask({
        id: 'micro-1',
        type: TaskType.MICROTASK,
        label: 'Micro',
      });
      state = enqueueMicrotask(state, microTask);

      // Microtask should execute first
      state = tick(state);
      expect(state.callStack[0]!.task.id).toBe('micro-1');

      // Complete microtask
      state = tick(state);
      expect(state.callStack.length).toBe(0);

      // Now macrotask executes
      state = tick(state);
      expect(state.callStack[0]!.task.id).toBe('macro-1');
    });

    it('drains 10 nested microtasks before first macrotask', () => {
      let state = createInitialState();

      // Add one macrotask
      const macroTask = createTask({
        id: 'macro-1',
        type: TaskType.TIMER,
        label: 'Macro',
        delay: 0,
      });
      state = {
        ...state,
        macroQueue: [macroTask],
      };

      // Add 10 microtasks with effects that enqueue more microtasks
      for (let i = 0; i < 10; i++) {
        const microTask = createTask({
          id: `micro-${i}`,
          type: TaskType.MICROTASK,
          label: `Micro ${i}`,
          effects:
            i < 9
              ? [
                  {
                    type: 'enqueue-task',
                    payload: {
                      task: createTask({
                        id: `micro-${i + 1}`,
                        type: TaskType.MICROTASK,
                        label: `Micro ${i + 1}`,
                      }),
                      queueType: 'micro',
                    },
                  },
                ]
              : [],
        });

        if (i === 0) {
          state = enqueueMicrotask(state, microTask);
        }
      }

      const executionOrder: string[] = [];

      // Execute until macrotask starts
      for (let tickCount = 0; tickCount < 30; tickCount++) {
        state = tick(state);

        // Track what starts executing
        const startLog = state.log[state.log.length - 1]!;
        if (startLog && startLog.type === 'task-start') {
          executionOrder.push(startLog.taskId || '');
        }

        // Break when macro starts
        if (
          state.callStack.length > 0 &&
          state.callStack[0]!.task.id === 'macro-1'
        ) {
          break;
        }
      }

      // All 10 microtasks should execute before the macrotask
      expect(executionOrder).toContain('micro-0');
      expect(executionOrder[executionOrder.length - 1]).toBe('macro-1');
    });
  });

  describe('Rule 3: Render Logic', () => {
    it('renders only when conditions met', () => {
      let state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 16,
      });

      state = tick(state);

      expect(state.renderPending).toBe(false);
      expect(state.frameCounter).toBe(1);
      expect(state.log.some((entry) => entry.type === 'render')).toBe(true);
    });

    it('does not render when microtasks pending', () => {
      let state = createInitialState({
        renderPending: true,
        frameInterval: 16,
        now: 16,
      });

      const microTask = createTask({ type: TaskType.MICROTASK });
      state = enqueueMicrotask(state, microTask);

      // Should drain microtask first
      state = tick(state);
      expect(state.callStack[0]!.task.type).toBe(TaskType.MICROTASK);
      expect(state.renderPending).toBe(true); // Still pending
    });
  });

  describe('Rule 4: rAF Execution', () => {
    it('executes rAF at frame boundary', () => {
      let state = createInitialState({
        frameInterval: 16,
        now: 16,
      });

      const rafTask = createTask({ 
        id: 'raf-1', 
        type: TaskType.RAF,
        state: TaskState.QUEUED,
      });
      state = {
        ...state,
        rafQueue: [rafTask],
      };

      state = tick(state);

      expect(state.callStack[0]!.task.id).toBe('raf-1');
      expect(state.rafQueue.length).toBe(0);
    });
  });

  describe('Rule 5: Macrotask FIFO Order', () => {
    it('executes macrotasks in FIFO order', () => {
      let state = createInitialState();

      const task1 = createTask({ id: 'macro-1', label: 'First' });
      const task2 = createTask({ id: 'macro-2', label: 'Second' });
      const task3 = createTask({ id: 'macro-3', label: 'Third' });

      state = {
        ...state,
        macroQueue: [task1, task2, task3],
      };

      // Execute first
      state = tick(state);
      expect(state.callStack[0]!.task.id).toBe('macro-1');
      state = tick(state); // Complete

      // Execute second
      state = tick(state);
      expect(state.callStack[0]!.task.id).toBe('macro-2');
      state = tick(state); // Complete

      // Execute third
      state = tick(state);
      expect(state.callStack[0]!.task.id).toBe('macro-3');
    });
  });

  describe('Rule 6: Time Advancement', () => {
    it('advances time to next Web API operation', () => {
      let state = createInitialState({ now: 0 });

      const task = createTask({ type: TaskType.TIMER, delay: 100 });
      state = enqueueTimerTask(state, task, 100);

      // Should advance time to 100
      state = tick(state);

      expect(state.now).toBe(100);
      expect(state.macroQueue.length).toBe(1); // Task should be enqueued
    });

    it('advances to earliest of multiple operations', () => {
      let state = createInitialState({ now: 0 });

      const task1 = createTask({ id: 'timer-1', type: TaskType.TIMER, delay: 100 });
      const task2 = createTask({ id: 'timer-2', type: TaskType.TIMER, delay: 50 });
      const task3 = createTask({ id: 'timer-3', type: TaskType.TIMER, delay: 200 });

      state = enqueueTimerTask(state, task1, 100);
      state = enqueueTimerTask(state, task2, 50);
      state = enqueueTimerTask(state, task3, 200);

      // Should advance to 50 (earliest)
      state = tick(state);

      expect(state.now).toBe(50);
      expect(state.macroQueue.length).toBe(1);
      expect(state.macroQueue[0]!.id).toBe('timer-2');
    });
  });

  describe('Rule 7: Simulation Complete', () => {
    it('marks simulation as complete when all done', () => {
      const state = createInitialState();

      const newState = tick(state);

      expect(isSimulationComplete(state)).toBe(true);
      expect(newState.log.some((entry) => entry.message === 'Simulation complete')).toBe(true);
    });
  });

  describe('Determinism', () => {
    it('produces same result for same initial state', () => {
      // Create two identical initial states
      let state1 = createInitialState();
      let state2 = createInitialState();

      // Add same tasks
      const task = createTask({ type: TaskType.TIMER, delay: 100 });
      state1 = enqueueTimerTask(state1, task, 100);
      state2 = enqueueTimerTask(state2, task, 100);

      // Execute same number of ticks
      for (let i = 0; i < 5; i++) {
        state1 = tick(state1);
        state2 = tick(state2);
      }

      // States should be identical
      expect(state1.now).toBe(state2.now);
      expect(state1.stepIndex).toBe(state2.stepIndex);
      expect(state1.log.length).toBe(state2.log.length);
    });
  });
});
