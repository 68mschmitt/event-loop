import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';
import type { WebApiOperation } from '@/core/types/webapi';

export function WebApis() {
  const state = useSimulator();
  const { webApis, now } = state;
  
  const operations = Array.from(webApis.values()) as WebApiOperation[];
  
  return (
    <Region 
      title="Web APIs" 
      count={operations.length}
      emptyMessage="No pending operations"
    >
      {operations.length > 0 && (
        <div className="space-y-2">
          {operations.map((op: WebApiOperation) => (
            <div key={op.id} className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <TaskNode task={op.payloadTask} />
              <div className="mt-2 text-xs text-zinc-500 font-mono">
                Ready at: {op.readyAt}ms (in {Math.max(0, op.readyAt - now)}ms)
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                Target: {op.targetQueue}
              </div>
            </div>
          ))}
        </div>
      )}
    </Region>
  );
}
