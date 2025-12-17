/**
 * RuleReference component - displays event loop rule information.
 */

import type { EventLoopRule } from './explanationText';

export interface RuleReferenceProps {
  rule: EventLoopRule;
  showDetails?: boolean;
}

/**
 * Displays a reference to an event loop rule with details.
 */
export function RuleReference({ rule, showDetails = false }: RuleReferenceProps) {
  return (
    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
          {rule.number}
        </span>
        <h4 className="font-semibold text-blue-900 dark:text-blue-100">{rule.name}</h4>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{rule.description}</p>

      {showDetails && (
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Condition: </span>
            <span className="text-gray-700 dark:text-gray-300">{rule.condition}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Action: </span>
            <span className="text-gray-700 dark:text-gray-300">{rule.action}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Effect: </span>
            <span className="text-gray-700 dark:text-gray-300">{rule.effect}</span>
          </div>
        </div>
      )}

      <a
        href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Learn more about the event loop
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
