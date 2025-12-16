
export function ScenarioBuilder() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Scenario Builder
        </h3>
        <p className="text-sm text-zinc-400">
          Create custom scenarios by adding tasks manually.
        </p>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400 mb-2">
          Scenario builder UI will be implemented in Phase 6 (Session 6.2).
        </p>
        <div className="space-y-2 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-400">Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/remove tasks</li>
            <li>Configure task properties (delay, latency, etc.)</li>
            <li>Define task dependencies</li>
            <li>Validate scenario structure</li>
            <li>Export/import scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
