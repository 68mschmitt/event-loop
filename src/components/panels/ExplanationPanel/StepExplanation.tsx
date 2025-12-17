/**
 * StepExplanation component - displays the explanation for the current step.
 */

import type { StepExplanation, ExplanationMode, StateChange } from './explanationText';
import { Badge } from '@/components/common';

export interface StepExplanationProps {
  explanation: StepExplanation;
  mode: ExplanationMode;
}

/**
 * Displays state changes.
 */
function StateChanges({ changes }: { changes: StateChange[] }) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
        State Changes
      </h5>
      <ul className="space-y-1">
        {changes.map((change, index) => (
          <li key={index} className="flex items-start gap-2 text-xs">
            <Badge variant={getChangeVariant(change.type)}>
              {change.type}
            </Badge>
            <span className="text-gray-700 dark:text-gray-300 flex-1">{change.details}</span>
            {change.location && (
              <span className="text-gray-500 dark:text-gray-500 text-xs">
                {change.location}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Get badge variant for change type.
 */
function getChangeVariant(type: StateChange['type']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (type) {
    case 'enqueue':
    case 'push':
      return 'success';
    case 'dequeue':
    case 'pop':
      return 'warning';
    case 'update':
      return 'info';
    case 'render':
      return 'success';
    case 'time-advance':
      return 'info';
    default:
      return 'neutral';
  }
}

/**
 * Displays the explanation for the current simulation step.
 */
export function StepExplanation({ explanation, mode }: StepExplanationProps) {
  return (
    <div className="space-y-3">
      {/* Step number */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Step {explanation.stepIndex}
        </span>
        <Badge variant="info">Rule {explanation.rule.number}</Badge>
      </div>

      {/* Summary (always shown) */}
      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
        {explanation.summary}
      </div>

      {/* Detailed explanation (shown in detailed/expert mode) */}
      {mode !== 'basic' && (
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {explanation.details}
        </div>
      )}

      {/* Reasoning (shown in expert mode) */}
      {mode === 'expert' && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Why This Happened
          </h5>
          <p className="text-xs text-gray-700 dark:text-gray-300 italic">{explanation.reasoning}</p>
        </div>
      )}

      {/* Involved tasks (shown in detailed/expert mode) */}
      {mode !== 'basic' && explanation.involvedTasks.length > 0 && (
        <div className="mt-3">
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Involved Tasks
          </h5>
          <div className="flex flex-wrap gap-1">
            {explanation.involvedTasks.map((taskId) => (
              <Badge key={taskId} variant="neutral">
                {taskId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* State changes (shown in expert mode) */}
      {mode === 'expert' && <StateChanges changes={explanation.stateChanges} />}
    </div>
  );
}
