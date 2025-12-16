/**
 * Timeline Helper Utilities
 * 
 * Position calculations, scaling, and event extraction for timeline visualization.
 */

import type { SimulatorStateWithHistory } from '@/state/types';

/**
 * Timeline event types
 */
export type TimelineEventType = 
  | 'task-enqueue' 
  | 'task-complete' 
  | 'render' 
  | 'tick'
  | 'microtask'
  | 'macro-task';

/**
 * Timeline event marker
 */
export interface TimelineEvent {
  stepIndex: number;
  type: TimelineEventType;
  label: string;
  color: string;
}

/**
 * Extract timeline events from history
 */
export function extractTimelineEvents(
  history: SimulatorStateWithHistory['history']
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  history.forEach((snapshot, index) => {
    const state = snapshot.state;
    
    // Check for renders
    if (state.renderPending) {
      events.push({
        stepIndex: index,
        type: 'render',
        label: 'Render pending',
        color: 'bg-purple-500',
      });
    }
    
    // Check for new tasks in macro queue
    const prevState = index > 0 ? history[index - 1]?.state : null;
    const prevMacroCount = prevState ? prevState.macroQueue.length : 0;
    if (state.macroQueue.length > prevMacroCount) {
      events.push({
        stepIndex: index,
        type: 'macro-task',
        label: 'Macro task enqueued',
        color: 'bg-blue-500',
      });
    }
    
    // Check for new microtasks
    const prevMicroCount = prevState ? prevState.microQueue.length : 0;
    if (state.microQueue.length > prevMicroCount) {
      events.push({
        stepIndex: index,
        type: 'microtask',
        label: 'Microtask enqueued',
        color: 'bg-green-500',
      });
    }
  });
  
  return events;
}

/**
 * Convert mouse/touch X position to step index
 */
export function getStepFromPosition(
  clientX: number,
  timelineRect: DOMRect,
  totalSteps: number
): number {
  const relativeX = clientX - timelineRect.left;
  const percentage = Math.max(0, Math.min(1, relativeX / timelineRect.width));
  return Math.floor(percentage * (totalSteps - 1));
}

/**
 * Convert step index to X position
 */
export function getPositionFromStep(
  stepIndex: number,
  timelineWidth: number,
  totalSteps: number
): number {
  if (totalSteps <= 1) return 0;
  const percentage = stepIndex / (totalSteps - 1);
  return percentage * timelineWidth;
}

/**
 * Format step number with label
 */
export function formatStepLabel(stepIndex: number, totalSteps: number): string {
  return `Step ${stepIndex + 1} of ${totalSteps}`;
}

/**
 * Calculate viewport range for minimap
 */
export function calculateViewportRange(
  currentStep: number,
  totalSteps: number,
  viewportSize: number = 50
): { start: number; end: number } {
  const halfViewport = Math.floor(viewportSize / 2);
  let start = Math.max(0, currentStep - halfViewport);
  let end = Math.min(totalSteps - 1, currentStep + halfViewport);
  
  // Adjust if we're at the edges
  if (end - start < viewportSize) {
    if (start === 0) {
      end = Math.min(totalSteps - 1, viewportSize);
    } else if (end === totalSteps - 1) {
      start = Math.max(0, totalSteps - viewportSize);
    }
  }
  
  return { start, end };
}
