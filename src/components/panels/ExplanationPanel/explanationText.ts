/**
 * Explanation text database for event loop rules.
 * Maps simulation steps to human-readable explanations.
 */

import type { SimulatorState } from '@/core/types';

/**
 * Event loop rule reference.
 */
export interface EventLoopRule {
  number: number;
  name: string;
  description: string;
  condition: string;
  action: string;
  effect: string;
}

/**
 * State change description.
 */
export interface StateChange {
  type: 'enqueue' | 'dequeue' | 'push' | 'pop' | 'update' | 'render' | 'time-advance';
  location: 'callstack' | 'macro' | 'micro' | 'raf' | 'webapi';
  taskId?: string;
  details: string;
}

/**
 * Explanation for a single simulation step.
 */
export interface StepExplanation {
  stepIndex: number;
  rule: EventLoopRule;
  summary: string;
  details: string;
  reasoning: string;
  involvedTasks: string[];
  stateChanges: StateChange[];
}

/**
 * Explanation mode.
 */
export type ExplanationMode = 'basic' | 'detailed' | 'expert';

/**
 * Explanation template.
 */
interface ExplanationTemplate {
  basic: string;
  detailed: string;
  reasoning: string;
}

/**
 * Rule descriptions matching event-loop-rules.md
 */
export const RULES: Record<number, EventLoopRule> = {
  1: {
    number: 1,
    name: 'Complete Current Call Stack Frame',
    description: 'When a task is running, it must complete before anything else happens.',
    condition: 'Call stack is non-empty AND top frame has remaining steps',
    action: 'Execute one step of the current frame, decrement stepsRemaining',
    effect: 'Task continues running (or completes if stepsRemaining reaches 0)',
  },
  2: {
    number: 2,
    name: 'Drain Microtask Queue',
    description: 'Microtasks run to completion before any macrotasks or rendering.',
    condition: 'Call stack is empty AND microtask queue is non-empty',
    action: 'Dequeue one microtask, push to call stack',
    effect: 'Microtask begins executing',
  },
  3: {
    number: 3,
    name: 'Check for Render',
    description: 'Browser checks if it\'s time to render the page.',
    condition: 'All queues empty AND renderPending is true AND enough time passed',
    action: 'Execute render step',
    effect: 'Page updates visually, renderPending set to false',
  },
  4: {
    number: 4,
    name: 'Execute rAF Callback',
    description: 'requestAnimationFrame callbacks run before paint.',
    condition: 'Call stack empty AND microtasks empty AND render occurred AND rAF queue non-empty',
    action: 'Dequeue one rAF callback, push to call stack',
    effect: 'rAF callback begins executing',
  },
  5: {
    number: 5,
    name: 'Execute Macrotask',
    description: 'Regular tasks (timers, events) run one at a time.',
    condition: 'Call stack empty AND microtasks empty AND macrotask queue non-empty',
    action: 'Dequeue one macrotask, push to call stack',
    effect: 'Macrotask begins executing',
  },
  6: {
    number: 6,
    name: 'Advance Time',
    description: 'When nothing is ready, jump forward to the next event.',
    condition: 'All queues empty AND Web APIs have pending operations',
    action: 'Set time to earliest readyAt, enqueue ready operations',
    effect: 'Time advances to next event',
  },
  7: {
    number: 7,
    name: 'Simulation Complete',
    description: 'All work is done, simulation ends.',
    condition: 'All queues empty AND no Web API operations pending',
    action: 'Mark simulation as complete',
    effect: 'No more ticks possible',
  },
};

/**
 * Explanation templates by rule number.
 */
export const EXPLANATIONS: Record<number, ExplanationTemplate> = {
  1: {
    basic: 'Continuing to execute {{taskLabel}}...',
    detailed:
      'The call stack has {{taskLabel}} running with {{stepsRemaining}} steps remaining. We must let it complete its current step before doing anything else.',
    reasoning: 'Rule 1 has highest priority: tasks that start must finish uninterrupted.',
  },
  2: {
    basic: 'Running microtask {{taskLabel}} from the microtask queue.',
    detailed:
      'The call stack is now empty. Rule 2 says we must check the microtask queue next. Found {{taskLabel}}, moving it to the call stack to execute.',
    reasoning:
      'Microtasks always run before macrotasks. This ensures promises resolve as quickly as possible.',
  },
  3: {
    basic: 'Rendering the page (style, layout, paint).',
    detailed:
      'All JavaScript execution is paused. The browser needs to render because renderPending was set to true and {{frameInterval}}ms have passed since the last frame.',
    reasoning:
      'The browser must update the visual display at regular intervals (typically 60fps).',
  },
  4: {
    basic: 'Running requestAnimationFrame callback {{taskLabel}}.',
    detailed:
      'A render opportunity just occurred. Before painting, we run any rAF callbacks. Found {{taskLabel}} in the rAF queue.',
    reasoning:
      'rAF callbacks run in the frame phase to allow animations to update just before paint.',
  },
  5: {
    basic: 'Running macrotask {{taskLabel}} from the macrotask queue.',
    detailed:
      'The call stack is empty and microtask queue is empty. Time to process the next macrotask. Dequeuing {{taskLabel}}.',
    reasoning: 'Macrotasks run one per tick after all microtasks are drained.',
  },
  6: {
    basic: 'Advancing time from {{fromTime}}ms to {{toTime}}ms.',
    detailed:
      'Nothing is ready to execute right now. Jumping ahead to {{toTime}}ms when {{taskLabel}} will be ready.',
    reasoning: 'When all queues are empty, we fast-forward to the next scheduled event.',
  },
  7: {
    basic: 'Simulation complete - no more work to do!',
    detailed:
      'All queues are empty and no Web API operations are pending. The event loop has nothing left to process.',
    reasoning: 'The simulation ends when there\'s no more work scheduled.',
  },
};

/**
 * Check if simulation is complete.
 */
function isSimulationComplete(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.macroQueue.length === 0 &&
    state.rafQueue.length === 0 &&
    state.webApis.size === 0
  );
}

/**
 * Determine which rule was applied between two states.
 */
export function determineRule(prev: SimulatorState, next: SimulatorState): EventLoopRule {
  // Simulation complete
  if (isSimulationComplete(next)) {
    return RULES[7]!;
  }

  // Call stack was running and continued
  if (prev.callStack.length > 0 && next.callStack.length > 0) {
    const prevFrame = prev.callStack[prev.callStack.length - 1];
    const nextFrame = next.callStack[next.callStack.length - 1];

    if (
      prevFrame &&
      nextFrame &&
      prevFrame.task.id === nextFrame.task.id &&
      nextFrame.stepsRemaining < prevFrame.stepsRemaining
    ) {
      return RULES[1]!;
    }
  }

  // Microtask was dequeued
  if (
    prev.callStack.length === 0 &&
    next.callStack.length > 0 &&
    prev.microQueue.length > next.microQueue.length
  ) {
    return RULES[2]!;
  }

  // Render occurred
  if (prev.renderPending && !next.renderPending) {
    return RULES[3]!;
  }

  // rAF callback dequeued
  if (prev.rafQueue.length > next.rafQueue.length && next.callStack.length > 0) {
    return RULES[4]!;
  }

  // Macrotask dequeued
  if (prev.macroQueue.length > next.macroQueue.length && next.callStack.length > 0) {
    return RULES[5]!;
  }

  // Time advanced
  if (
    next.now > prev.now &&
    prev.callStack.length === 0 &&
    prev.microQueue.length === 0 &&
    prev.macroQueue.length === 0
  ) {
    return RULES[6]!;
  }

  // Fallback
  return RULES[1]!;
}

/**
 * Extract variables for template interpolation.
 */
function extractVariables(prev: SimulatorState, next: SimulatorState): Record<string, string> {
  const variables: Record<string, string> = {
    fromTime: String(prev.now),
    toTime: String(next.now),
    frameInterval: String(next.frameInterval),
  };

  // Add task labels
  if (next.callStack.length > 0) {
    const currentFrame = next.callStack[next.callStack.length - 1];
    if (currentFrame) {
      variables['taskLabel'] = currentFrame.task.label;
      variables['stepsRemaining'] = String(currentFrame.stepsRemaining);
    }
  }

  // For time advance, look for next task in Web APIs
  if (next.now > prev.now && next.callStack.length === 0) {
    const nextOperation = Array.from(next.webApis.values()).find((op) => op.readyAt === next.now);
    if (nextOperation) {
      variables['taskLabel'] = nextOperation.payloadTask.label;
    }
  }

  return variables;
}

/**
 * Interpolate template with variables.
 */
function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Extract involved tasks.
 */
function extractInvolvedTasks(prev: SimulatorState, next: SimulatorState): string[] {
  const tasks: string[] = [];

  // Tasks on call stack
  next.callStack.forEach((frame) => {
    tasks.push(frame.task.id);
  });

  // Tasks that were dequeued
  if (prev.microQueue.length > next.microQueue.length) {
    const dequeuedTask = prev.microQueue[0];
    if (dequeuedTask && !tasks.includes(dequeuedTask.id)) {
      tasks.push(dequeuedTask.id);
    }
  }

  if (prev.macroQueue.length > next.macroQueue.length) {
    const dequeuedTask = prev.macroQueue[0];
    if (dequeuedTask && !tasks.includes(dequeuedTask.id)) {
      tasks.push(dequeuedTask.id);
    }
  }

  if (prev.rafQueue.length > next.rafQueue.length) {
    const dequeuedTask = prev.rafQueue[0];
    if (dequeuedTask && !tasks.includes(dequeuedTask.id)) {
      tasks.push(dequeuedTask.id);
    }
  }

  return tasks;
}

/**
 * Detect state changes between two states.
 */
function detectStateChanges(prev: SimulatorState, next: SimulatorState): StateChange[] {
  const changes: StateChange[] = [];

  // Call stack changes
  if (prev.callStack.length < next.callStack.length) {
    const newFrame = next.callStack[next.callStack.length - 1];
    if (newFrame) {
      changes.push({
        type: 'push',
        location: 'callstack',
        taskId: newFrame.task.id,
        details: `Pushed ${newFrame.task.label} to call stack`,
      });
    }
  } else if (prev.callStack.length > next.callStack.length) {
    const removedFrame = prev.callStack[prev.callStack.length - 1];
    if (removedFrame) {
      changes.push({
        type: 'pop',
        location: 'callstack',
        taskId: removedFrame.task.id,
        details: `Popped ${removedFrame.task.label} from call stack`,
      });
    }
  } else if (prev.callStack.length > 0 && next.callStack.length > 0) {
    const prevFrame = prev.callStack[prev.callStack.length - 1];
    const nextFrame = next.callStack[next.callStack.length - 1];
    if (prevFrame && nextFrame && prevFrame.stepsRemaining !== nextFrame.stepsRemaining) {
      changes.push({
        type: 'update',
        location: 'callstack',
        taskId: nextFrame.task.id,
        details: `Executed step of ${nextFrame.task.label}`,
      });
    }
  }

  // Queue changes
  if (prev.microQueue.length > next.microQueue.length && prev.microQueue[0]) {
    changes.push({
      type: 'dequeue',
      location: 'micro',
      taskId: prev.microQueue[0].id,
      details: 'Dequeued microtask',
    });
  }

  if (prev.macroQueue.length > next.macroQueue.length && prev.macroQueue[0]) {
    changes.push({
      type: 'dequeue',
      location: 'macro',
      taskId: prev.macroQueue[0].id,
      details: 'Dequeued macrotask',
    });
  }

  if (prev.rafQueue.length > next.rafQueue.length && prev.rafQueue[0]) {
    changes.push({
      type: 'dequeue',
      location: 'raf',
      taskId: prev.rafQueue[0].id,
      details: 'Dequeued rAF callback',
    });
  }

  // Render changes
  if (prev.renderPending && !next.renderPending) {
    changes.push({
      type: 'render',
      location: 'callstack',
      details: 'Rendered frame',
    });
  }

  // Time advance
  if (next.now > prev.now) {
    changes.push({
      type: 'time-advance',
      location: 'webapi',
      details: `Advanced time from ${prev.now}ms to ${next.now}ms`,
    });
  }

  return changes;
}

/**
 * Generate explanation for a step.
 */
export function generateExplanation(
  prevState: SimulatorState,
  nextState: SimulatorState,
  _mode: ExplanationMode = 'basic'
): StepExplanation {
  const rule = determineRule(prevState, nextState);
  const template = EXPLANATIONS[rule.number];

  if (!template) {
    throw new Error(`No explanation template found for rule ${rule.number}`);
  }

  const variables = extractVariables(prevState, nextState);

  return {
    stepIndex: nextState.stepIndex,
    rule,
    summary: interpolate(template.basic, variables),
    details: interpolate(template.detailed, variables),
    reasoning: interpolate(template.reasoning, variables),
    involvedTasks: extractInvolvedTasks(prevState, nextState),
    stateChanges: detectStateChanges(prevState, nextState),
  };
}
