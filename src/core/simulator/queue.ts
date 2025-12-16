/**
 * Queue and Stack implementations.
 * Generic FIFO (queue) and LIFO (stack) data structures.
 */

import type { Queue, Stack } from '@/core/types/queue';

/**
 * FIFO Queue implementation.
 * Uses JavaScript array with push/shift operations.
 * Performance: enqueue O(1), dequeue O(n) - acceptable for small queues.
 */
export class QueueImpl<T> implements Queue<T> {
  private items: T[] = [];

  /**
   * Add an item to the back of the queue.
   * Time complexity: O(1) amortized
   */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   * Remove and return the item at the front of the queue.
   * Time complexity: O(n) - shifts all elements
   * Returns undefined if queue is empty.
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * Return the item at the front of the queue without removing it.
   * Time complexity: O(1)
   * Returns undefined if queue is empty.
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Return the number of items in the queue.
   * Time complexity: O(1)
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Check if the queue is empty.
   * Time complexity: O(1)
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Return a copy of all items in the queue as an array.
   * Front of queue is at index 0.
   * Time complexity: O(n)
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Remove all items from the queue.
   * Time complexity: O(1)
   */
  clear(): void {
    this.items = [];
  }
}

/**
 * LIFO Stack implementation.
 * Uses JavaScript array with push/pop operations.
 * Performance: push O(1), pop O(1)
 */
export class StackImpl<T> implements Stack<T> {
  private items: T[] = [];

  /**
   * Add an item to the top of the stack.
   * Time complexity: O(1) amortized
   */
  push(item: T): void {
    this.items.push(item);
  }

  /**
   * Remove and return the item at the top of the stack.
   * Time complexity: O(1)
   * Returns undefined if stack is empty.
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Return the item at the top of the stack without removing it.
   * Time complexity: O(1)
   * Returns undefined if stack is empty.
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Return the number of items in the stack.
   * Time complexity: O(1)
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Check if the stack is empty.
   * Time complexity: O(1)
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Return a copy of all items in the stack as an array.
   * Top of stack is at the last index.
   * Time complexity: O(n)
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Remove all items from the stack.
   * Time complexity: O(1)
   */
  clear(): void {
    this.items = [];
  }
}
