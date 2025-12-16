
export function PresetsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Preset Scenarios
        </h3>
        <p className="text-sm text-zinc-400">
          Load pre-configured scenarios to explore different event loop behaviors.
        </p>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400 mb-2">
          Preset scenarios will be implemented in Phase 6 (Sessions 6.3-6.4).
        </p>
        <div className="space-y-2 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-400">Planned presets:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sync vs setTimeout(0)</li>
            <li>Promise.then vs setTimeout(0)</li>
            <li>Nested microtasks</li>
            <li>async/await multiple awaits</li>
            <li>fetch + timers + microtasks</li>
            <li>DOM event + microtasks</li>
            <li>rAF + rendering</li>
            <li>Microtask starvation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
