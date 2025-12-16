import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import type { LogEntry } from '@/core/types/simulator';

export function Console() {
  const state = useSimulator();
  const { log } = state;
  
  // Show last 20 entries
  const recentLogs = log.slice(-20);
  
  return (
    <Region 
      title="Console" 
      count={log.length}
      emptyMessage="No log entries"
    >
      {recentLogs.length > 0 && (
        <div className="space-y-1 font-mono text-xs">
          {recentLogs.map((entry: LogEntry, idx: number) => (
            <div key={idx} className="flex gap-2 text-zinc-400">
              <span className="text-zinc-600">[{entry.timestamp}ms]</span>
              <span className="text-zinc-500">{entry.type}</span>
              <span className="text-zinc-300">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </Region>
  );
}
