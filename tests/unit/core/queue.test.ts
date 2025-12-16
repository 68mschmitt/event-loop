/**
 * Tests for QueueImpl (FIFO queue).
 */

import { describe, it, expect } from 'vitest';
import { QueueImpl } from '@/core/simulator/queue';
import type { Task } from '@/core/types/task';
import { TaskType, TaskState } from '@/core/types/task';

describe('QueueImpl', () => {
  describe('FIFO ordering', () => {
    it('maintains FIFO order with strings', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('A');
      queue.enqueue('B');
      queue.enqueue('C');

      expect(queue.dequeue()).toBe('A');
      expect(queue.dequeue()).toBe('B');
      expect(queue.dequeue()).toBe('C');
      expect(queue.dequeue()).toBeUndefined();
    });

    it('maintains FIFO order with numbers', () => {
      const queue = new QueueImpl<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
    });

    it('maintains FIFO order with mixed operations', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('A');
      queue.enqueue('B');
      expect(queue.dequeue()).toBe('A');
      queue.enqueue('C');
      expect(queue.dequeue()).toBe('B');
      expect(queue.dequeue()).toBe('C');
    });
  });

  describe('size tracking', () => {
    it('tracks size correctly', () => {
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

    it('tracks size with multiple operations', () => {
      const queue = new QueueImpl<string>();
      expect(queue.size()).toBe(0);

      queue.enqueue('A');
      queue.enqueue('B');
      queue.enqueue('C');
      expect(queue.size()).toBe(3);

      queue.dequeue();
      queue.dequeue();
      expect(queue.size()).toBe(1);

      queue.enqueue('D');
      queue.enqueue('E');
      expect(queue.size()).toBe(3);
    });
  });

  describe('peek', () => {
    it('does not remove item', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('first');
      queue.enqueue('second');

      expect(queue.peek()).toBe('first');
      expect(queue.peek()).toBe('first');
      expect(queue.size()).toBe(2);
    });

    it('returns undefined on empty queue', () => {
      const queue = new QueueImpl<string>();
      expect(queue.peek()).toBeUndefined();
    });

    it('returns correct item after dequeue', () => {
      const queue = new QueueImpl<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      expect(queue.peek()).toBe(1);
      queue.dequeue();
      expect(queue.peek()).toBe(2);
      queue.dequeue();
      expect(queue.peek()).toBe(3);
    });
  });

  describe('toArray immutability', () => {
    it('returns copy', () => {
      const queue = new QueueImpl<number>();
      queue.enqueue(1);
      queue.enqueue(2);

      const arr = queue.toArray();
      arr.push(3); // Modify copy

      expect(queue.size()).toBe(2); // Original unchanged
      expect(queue.toArray()).toEqual([1, 2]);
    });

    it('returns empty array for empty queue', () => {
      const queue = new QueueImpl<string>();
      expect(queue.toArray()).toEqual([]);
    });

    it('returns array with correct order', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('A');
      queue.enqueue('B');
      queue.enqueue('C');

      expect(queue.toArray()).toEqual(['A', 'B', 'C']);
    });

    it('mutations to returned array do not affect queue', () => {
      const queue = new QueueImpl<number>();
      queue.enqueue(10);
      queue.enqueue(20);

      const arr1 = queue.toArray();
      arr1[0] = 99;

      const arr2 = queue.toArray();
      expect(arr2[0]).toBe(10); // Original value preserved
    });
  });

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const queue = new QueueImpl<string>();
      expect(queue.isEmpty()).toBe(true);
    });

    it('returns false after enqueue', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('item');
      expect(queue.isEmpty()).toBe(false);
    });

    it('returns true after dequeuing all items', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('A');
      queue.enqueue('B');
      queue.dequeue();
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      const queue = new QueueImpl<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      queue.clear();

      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.dequeue()).toBeUndefined();
    });

    it('works on empty queue', () => {
      const queue = new QueueImpl<string>();
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe('generic type support', () => {
    it('works with custom Task type', () => {
      interface MockTask {
        id: string;
        label: string;
      }

      const queue = new QueueImpl<MockTask>();
      const task: MockTask = { id: '1', label: 'Test' };

      queue.enqueue(task);
      const retrieved = queue.dequeue();

      expect(retrieved).toEqual(task);
    });

    it('works with real Task type', () => {
      const queue = new QueueImpl<Task>();
      const task: Task = {
        id: 'task-1',
        type: TaskType.SYNC,
        label: 'Sync Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: 'scenario',
        state: TaskState.QUEUED,
        durationSteps: 1,
        effects: [],
      };

      queue.enqueue(task);
      expect(queue.size()).toBe(1);

      const retrieved = queue.dequeue();
      expect(retrieved).toEqual(task);
      expect(retrieved?.type).toBe(TaskType.SYNC);
    });

    it('works with objects', () => {
      const queue = new QueueImpl<{ name: string; age: number }>();
      queue.enqueue({ name: 'Alice', age: 30 });
      queue.enqueue({ name: 'Bob', age: 25 });

      const first = queue.dequeue();
      expect(first).toEqual({ name: 'Alice', age: 30 });
    });
  });

  describe('edge cases', () => {
    it('handles dequeue on empty queue', () => {
      const queue = new QueueImpl<number>();
      expect(queue.dequeue()).toBeUndefined();
      expect(queue.dequeue()).toBeUndefined();
    });

    it('handles single item', () => {
      const queue = new QueueImpl<string>();
      queue.enqueue('only');

      expect(queue.size()).toBe(1);
      expect(queue.peek()).toBe('only');
      expect(queue.dequeue()).toBe('only');
      expect(queue.isEmpty()).toBe(true);
    });

    it('handles many items', () => {
      const queue = new QueueImpl<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }

      expect(queue.size()).toBe(count);

      for (let i = 0; i < count; i++) {
        expect(queue.dequeue()).toBe(i);
      }

      expect(queue.isEmpty()).toBe(true);
    });
  });
});
