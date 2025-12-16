/**
 * Tests for StackImpl (LIFO stack).
 */

import { describe, it, expect } from 'vitest';
import { StackImpl } from '@/core/simulator/queue';
import type { Frame } from '@/core/types/simulator';
import { TaskType, TaskState } from '@/core/types/task';

describe('StackImpl', () => {
  describe('LIFO ordering', () => {
    it('maintains LIFO order with strings', () => {
      const stack = new StackImpl<string>();
      stack.push('A');
      stack.push('B');
      stack.push('C');

      expect(stack.pop()).toBe('C');
      expect(stack.pop()).toBe('B');
      expect(stack.pop()).toBe('A');
      expect(stack.pop()).toBeUndefined();
    });

    it('maintains LIFO order with numbers', () => {
      const stack = new StackImpl<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });

    it('maintains LIFO order with mixed operations', () => {
      const stack = new StackImpl<string>();
      stack.push('A');
      stack.push('B');
      expect(stack.pop()).toBe('B');
      stack.push('C');
      expect(stack.pop()).toBe('C');
      expect(stack.pop()).toBe('A');
    });
  });

  describe('size tracking', () => {
    it('tracks size correctly', () => {
      const stack = new StackImpl<number>();
      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);

      stack.push(1);
      stack.push(2);
      expect(stack.size()).toBe(2);
      expect(stack.isEmpty()).toBe(false);

      stack.pop();
      expect(stack.size()).toBe(1);

      stack.pop();
      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });

    it('tracks size with multiple operations', () => {
      const stack = new StackImpl<string>();
      expect(stack.size()).toBe(0);

      stack.push('A');
      stack.push('B');
      stack.push('C');
      expect(stack.size()).toBe(3);

      stack.pop();
      stack.pop();
      expect(stack.size()).toBe(1);

      stack.push('D');
      stack.push('E');
      expect(stack.size()).toBe(3);
    });
  });

  describe('peek', () => {
    it('does not remove item', () => {
      const stack = new StackImpl<string>();
      stack.push('first');
      stack.push('second');

      expect(stack.peek()).toBe('second');
      expect(stack.peek()).toBe('second');
      expect(stack.size()).toBe(2);
    });

    it('returns undefined on empty stack', () => {
      const stack = new StackImpl<string>();
      expect(stack.peek()).toBeUndefined();
    });

    it('returns correct item after pop', () => {
      const stack = new StackImpl<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      expect(stack.peek()).toBe(3);
      stack.pop();
      expect(stack.peek()).toBe(2);
      stack.pop();
      expect(stack.peek()).toBe(1);
    });
  });

  describe('toArray immutability', () => {
    it('returns copy', () => {
      const stack = new StackImpl<number>();
      stack.push(1);
      stack.push(2);

      const arr = stack.toArray();
      arr.push(3); // Modify copy

      expect(stack.size()).toBe(2); // Original unchanged
      expect(stack.toArray()).toEqual([1, 2]);
    });

    it('returns empty array for empty stack', () => {
      const stack = new StackImpl<string>();
      expect(stack.toArray()).toEqual([]);
    });

    it('returns array with correct order (bottom to top)', () => {
      const stack = new StackImpl<string>();
      stack.push('A');
      stack.push('B');
      stack.push('C');

      // Top of stack is last element
      expect(stack.toArray()).toEqual(['A', 'B', 'C']);
    });

    it('mutations to returned array do not affect stack', () => {
      const stack = new StackImpl<number>();
      stack.push(10);
      stack.push(20);

      const arr1 = stack.toArray();
      arr1[1] = 99;

      const arr2 = stack.toArray();
      expect(arr2[1]).toBe(20); // Original value preserved
    });
  });

  describe('isEmpty', () => {
    it('returns true for new stack', () => {
      const stack = new StackImpl<string>();
      expect(stack.isEmpty()).toBe(true);
    });

    it('returns false after push', () => {
      const stack = new StackImpl<string>();
      stack.push('item');
      expect(stack.isEmpty()).toBe(false);
    });

    it('returns true after popping all items', () => {
      const stack = new StackImpl<string>();
      stack.push('A');
      stack.push('B');
      stack.pop();
      stack.pop();
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      const stack = new StackImpl<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      stack.clear();

      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.pop()).toBeUndefined();
    });

    it('works on empty stack', () => {
      const stack = new StackImpl<string>();
      stack.clear();
      expect(stack.size()).toBe(0);
    });
  });

  describe('generic type support', () => {
    it('works with Frame type', () => {
      const stack = new StackImpl<Frame>();
      const frame: Frame = {
        task: {
          id: 'task-1',
          type: TaskType.SYNC,
          label: 'Test Task',
          createdAt: 0,
          enqueueSeq: 0,
          origin: 'scenario',
          state: TaskState.RUNNING,
          durationSteps: 2,
          effects: [],
        },
        startedAt: 10,
        stepsRemaining: 2,
      };

      stack.push(frame);
      expect(stack.size()).toBe(1);

      const retrieved = stack.pop();
      expect(retrieved).toEqual(frame);
      expect(retrieved?.task.type).toBe(TaskType.SYNC);
    });

    it('works with objects', () => {
      const stack = new StackImpl<{ name: string; value: number }>();
      stack.push({ name: 'A', value: 1 });
      stack.push({ name: 'B', value: 2 });

      const top = stack.pop();
      expect(top).toEqual({ name: 'B', value: 2 });
    });
  });

  describe('edge cases', () => {
    it('handles pop on empty stack', () => {
      const stack = new StackImpl<number>();
      expect(stack.pop()).toBeUndefined();
      expect(stack.pop()).toBeUndefined();
    });

    it('handles single item', () => {
      const stack = new StackImpl<string>();
      stack.push('only');

      expect(stack.size()).toBe(1);
      expect(stack.peek()).toBe('only');
      expect(stack.pop()).toBe('only');
      expect(stack.isEmpty()).toBe(true);
    });

    it('handles many items', () => {
      const stack = new StackImpl<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        stack.push(i);
      }

      expect(stack.size()).toBe(count);

      // Pop in reverse order (LIFO)
      for (let i = count - 1; i >= 0; i--) {
        expect(stack.pop()).toBe(i);
      }

      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe('comparison with array behavior', () => {
    it('matches array push/pop behavior', () => {
      const stack = new StackImpl<number>();
      const arr: number[] = [];

      stack.push(1);
      arr.push(1);
      stack.push(2);
      arr.push(2);
      stack.push(3);
      arr.push(3);

      expect(stack.pop()).toBe(arr.pop());
      expect(stack.pop()).toBe(arr.pop());
      expect(stack.pop()).toBe(arr.pop());
    });
  });
});
