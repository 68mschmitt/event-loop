/**
 * Animation Queue
 * 
 * Manages sequential execution of animations with priority ordering.
 */

import type { AnimationQueueItem, StateChange, AnimationCallbacks } from './types';
import { ANIMATION_DURATIONS, ANIMATION_PRIORITIES, ANIMATION_DELAYS, getEffectiveDuration } from './config';

/**
 * Animation queue that executes animations sequentially
 */
export class AnimationQueue {
  private queue: AnimationQueueItem[] = [];
  private isExecuting = false;
  private callbacks: AnimationCallbacks = {};
  private speedMultiplier = 1;

  constructor(callbacks?: AnimationCallbacks) {
    this.callbacks = callbacks || {};
  }

  /**
   * Set animation speed multiplier
   */
  setSpeed(speed: number): void {
    this.speedMultiplier = speed;
  }

  /**
   * Add a state change to the animation queue
   */
  enqueue(change: StateChange): void {
    const item = this.createAnimationItem(change);
    
    // Insert based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(i => i.priority < item.priority);
    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }
  }

  /**
   * Add multiple changes to the queue
   */
  enqueueBatch(changes: StateChange[]): void {
    changes.forEach(change => this.enqueue(change));
  }

  /**
   * Execute all queued animations sequentially
   */
  async execute(): Promise<void> {
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        await this.executeItem(item);
      } catch (error) {
        this.callbacks.onAnimationError?.(
          error instanceof Error ? error : new Error('Animation error'),
          item
        );
      }
    }

    this.isExecuting = false;
    this.callbacks.onQueueEmpty?.();
  }

  /**
   * Execute a single animation item
   */
  private async executeItem(item: AnimationQueueItem): Promise<void> {
    this.callbacks.onAnimationStart?.(item);

    // Wait for delay
    if (item.delay > 0) {
      await this.wait(item.delay);
    }

    // Wait for animation duration
    const effectiveDuration = getEffectiveDuration(item.duration, this.speedMultiplier);
    
    // Create promise that resolves after animation completes
    await new Promise<void>(resolve => {
      item.resolve = resolve;
      setTimeout(() => {
        this.callbacks.onAnimationComplete?.(item);
        resolve();
      }, effectiveDuration);
    });
  }

  /**
   * Create animation item from state change
   */
  private createAnimationItem(change: StateChange): AnimationQueueItem {
    let duration: number = ANIMATION_DURATIONS.TASK_MOVE;
    let priority: number = ANIMATION_PRIORITIES.TASK_MOVE;
    let delay: number = ANIMATION_DELAYS.SEQUENTIAL;

    switch (change.type) {
      case 'TASK_CREATED':
        duration = ANIMATION_DURATIONS.TASK_CREATE;
        priority = ANIMATION_PRIORITIES.TASK_CREATE;
        delay = ANIMATION_DELAYS.IMMEDIATE;
        break;

      case 'TASK_MOVED':
        duration = ANIMATION_DURATIONS.TASK_MOVE;
        priority = ANIMATION_PRIORITIES.TASK_MOVE;
        delay = ANIMATION_DELAYS.SEQUENTIAL;
        break;

      case 'TASK_STATE':
        duration = ANIMATION_DURATIONS.TASK_STATE_CHANGE;
        priority = ANIMATION_PRIORITIES.TASK_STATE;
        delay = ANIMATION_DELAYS.BATCH;
        break;

      case 'STACK_PUSH':
        duration = ANIMATION_DURATIONS.STACK_PUSH;
        priority = ANIMATION_PRIORITIES.STACK_OPERATION;
        delay = ANIMATION_DELAYS.BATCH;
        break;

      case 'STACK_POP':
        duration = ANIMATION_DURATIONS.STACK_POP;
        priority = ANIMATION_PRIORITIES.STACK_OPERATION;
        delay = ANIMATION_DELAYS.BATCH;
        break;

      case 'CONSOLE_LOG':
        duration = ANIMATION_DURATIONS.CONSOLE_LOG;
        priority = ANIMATION_PRIORITIES.CONSOLE_LOG;
        delay = ANIMATION_DELAYS.IMMEDIATE;
        break;

      case 'TICK_START':
      case 'TICK_END':
        duration = ANIMATION_DURATIONS.TICK_START;
        priority = ANIMATION_PRIORITIES.TICK_BOUNDARY;
        delay = ANIMATION_DELAYS.IMMEDIATE;
        break;
    }

    return {
      id: `${change.type}-${change.taskId}-${Date.now()}`,
      change,
      duration,
      delay,
      priority,
    };
  }

  /**
   * Utility to wait for specified milliseconds
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is executing
   */
  isRunning(): boolean {
    return this.isExecuting;
  }
}
