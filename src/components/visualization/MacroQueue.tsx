import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';
import type { Task } from '@/core/types/task';

export function MacroQueue() {
  const state = useSimulator();
  const { macroQueue } = state;
  
  return (
    <Region 
      title="Macrotask Queue" 
      count={macroQueue.length}
      emptyMessage="No macrotasks queued"
    >
      {macroQueue.length > 0 && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {macroQueue.map((task: Task, idx: number) => (
            <div key={task.id} className="flex-shrink-0 w-full sm:w-48">
              {idx === 0 && (
                <div className="text-xs text-blue-400 font-semibold mb-1">← Next</div>
              )}
              <TaskNode task={task} />
            </div>
          ))}
        </div>
      )}
    </Region>
  );
}
