
export function Toolbar() {
  return (
    <div className="h-16 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <h1 className="text-xl font-semibold">Event Loop Visualizer</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Placeholders for Session 5.1 controls */}
        <div className="text-sm text-zinc-500">Controls coming in Phase 5</div>
      </div>
    </div>
  );
}
