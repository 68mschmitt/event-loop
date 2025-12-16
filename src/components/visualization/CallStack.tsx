import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function CallStack() {
  const state = useSimulator();
  const { callStack } = state;
  
  return (
    <Region 
      title="Call Stack" 
      count={callStack.length}
      emptyMessage="No tasks executing"
    >
      {callStack.length > 0 && (
        <div className="space-y-2">
          {/* Display bottom-to-top (array reversed) */}
          {[...callStack].reverse().map((frame) => (
            <div key={frame.task.id} className="relative">
              <TaskNode task={frame.task} />
              {/* Steps remaining indicator */}
              <div className="mt-1 text-xs text-zinc-500 font-mono">
                Steps remaining: {frame.stepsRemaining}
              </div>
            </div>
          ))}
        </div>
      )}
    </Region>
  );
}
