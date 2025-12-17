/**
 * ExplanationPanel - displays step-by-step explanations of simulation.
 */

import { useState } from 'react';
import { useSimulator } from '@/state/hooks';
import { useExplanation } from '@/hooks/useExplanation';
import { StepExplanation } from './ExplanationPanel/StepExplanation';
import { RuleReference } from './ExplanationPanel/RuleReference';
import type { ExplanationMode } from './ExplanationPanel/explanationText';

export interface ExplanationPanelProps {
  showRuleReferences?: boolean;
}

/**
 * Main explanation panel component.
 */
export function ExplanationPanel({ showRuleReferences = true }: ExplanationPanelProps) {
  const state = useSimulator();
  const explanation = useExplanation(state);
  const [mode, setMode] = useState<ExplanationMode>('basic');

  if (!explanation) {
    return (
      <section role="region" aria-label="Step explanation" className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Explanation</h3>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
          >
            <p className="text-sm text-zinc-400">
              Run the simulation to see step-by-step explanations.
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              This panel will explain what happened in each step and why, referencing the event
              loop rules that were applied.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      role="region"
      aria-label="Step explanation"
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Header with mode selector */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-800/50">
        <h3 className="text-lg font-semibold text-zinc-200">Explanation</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="explanation-mode" className="text-xs text-zinc-400">
            Detail level:
          </label>
          <select
            id="explanation-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ExplanationMode)}
            className="text-sm border border-zinc-600 rounded bg-zinc-700 text-zinc-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Explanation detail level"
          >
            <option value="basic">Basic</option>
            <option value="detailed">Detailed</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current step explanation */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
        >
          <StepExplanation explanation={explanation} mode={mode} />
        </div>

        {/* Rule reference */}
        {showRuleReferences && mode !== 'basic' && (
          <div className="rounded-lg">
            <RuleReference rule={explanation.rule} showDetails={mode === 'expert'} />
          </div>
        )}

        {/* Helpful tips for basic mode */}
        {mode === 'basic' && (
          <div className="text-xs text-zinc-500 italic p-3 border-t border-zinc-700">
            Tip: Switch to <strong>Detailed</strong> or <strong>Expert</strong> mode to see more
            information about event loop rules and state changes.
          </div>
        )}
      </div>
    </section>
  );
}
