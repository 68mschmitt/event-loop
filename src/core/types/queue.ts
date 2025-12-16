/**
 * Queue and stack interface definitions.
 * Generic interfaces for FIFO and LIFO data structures.
 */

/**
 * Generic queue interface (FIFO - First In, First Out).
 */
export interface Queue<T> {
  /**
   * Add an item to the back of the queue.
   */
  enqueue(item: T): void;

  /**
   * Remove and return the item at the front of the queue.
   * Returns undefined if queue is empty.
   */
  dequeue(): T | undefined;

  /**
   * Return the item at the front of the queue without removing it.
   * Returns undefined if queue is empty.
   */
  peek(): T | undefined;

  /**
   * Return the number of items in the queue.
   */
  size(): number;

  /**
   * Check if the queue is empty.
   */
  isEmpty(): boolean;

  /**
   * Return a copy of all items in the queue as an array.
   * Front of queue is at index 0.
   */
  toArray(): T[];

  /**
   * Remove all items from the queue.
   */
  clear(): void;
}

/**
 * Generic stack interface (LIFO - Last In, First Out).
 */
export interface Stack<T> {
  /**
   * Add an item to the top of the stack.
   */
  push(item: T): void;

  /**
   * Remove and return the item at the top of the stack.
   * Returns undefined if stack is empty.
   */
  pop(): T | undefined;

  /**
   * Return the item at the top of the stack without removing it.
   * Returns undefined if stack is empty.
   */
  peek(): T | undefined;

  /**
   * Return the number of items in the stack.
   */
  size(): number;

  /**
   * Check if the stack is empty.
   */
  isEmpty(): boolean;

  /**
   * Return a copy of all items in the stack as an array.
   * Top of stack is at the last index.
   */
  toArray(): T[];

  /**
   * Remove all items from the stack.
   */
  clear(): void;
}

/**
 * Type of queue in the simulator.
 */
export enum QueueType {
  MACRO = 'macro',
  MICRO = 'micro',
  RAF = 'raf',
}
