import { useSimulator } from '@/state/hooks';

export function ExplanationPanel() {
  const state = useSimulator();
  const { stepIndex, now } = state;
  
  return (
    <section 
      role="region" 
      aria-label="Step explanation" 
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Current State
        </h3>
        <div 
          role="status"
          aria-live="polite" 
          aria-atomic="true"
          className="space-y-2 text-sm text-zinc-400"
        >
          <p>Step: {stepIndex}</p>
          <p>Time: {now}ms</p>
        </div>
      </div>
      
      <div 
        aria-live="polite"
        aria-atomic="true"
        className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
      >
        <p className="text-sm text-zinc-400">
          Detailed step-by-step explanations will be added in Phase 8 (Session 8.1).
        </p>
        <p className="text-sm text-zinc-500 mt-2">
          This panel will explain what happened in the last step and why.
        </p>
      </div>
    </section>
  );
}
