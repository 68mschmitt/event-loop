
export function TaskInspector() {
  return (
    <section 
      role="region" 
      aria-label="Task inspector"
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Task Inspector
        </h3>
        <p className="text-sm text-zinc-400">
          Select a task from the visualization to view its details.
        </p>
      </div>
      
      <div 
        role="status"
        className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
      >
        <p className="text-sm text-zinc-400">
          Task lifecycle view and detailed metadata will be added in Phase 8 (Session 8.2).
        </p>
        <ul className="mt-2 text-sm text-zinc-500 list-disc list-inside space-y-1">
          <li>Task ID and label</li>
          <li>Type and state</li>
          <li>Creation time and origin</li>
          <li>Effects and dependencies</li>
          <li>Lifecycle timeline visualization</li>
        </ul>
      </div>
    </section>
  );
}
