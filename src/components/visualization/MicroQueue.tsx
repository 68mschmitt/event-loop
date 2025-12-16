import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';
import type { Task } from '@/core/types/task';

export function MicroQueue() {
  const state = useSimulator();
  const { microQueue } = state;
  
  const hasItems = microQueue.length > 0;
  
  return (
    <Region 
      title="Microtask Queue" 
      count={microQueue.length}
      emptyMessage="No microtasks queued"
      className={hasItems ? 'ring-2 ring-purple-500/50' : ''}
    >
      {hasItems && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {microQueue.map((task: Task, idx: number) => (
            <div key={task.id} className="flex-shrink-0 w-full sm:w-48">
              {idx === 0 && (
                <div className="text-xs text-purple-400 font-semibold mb-1">← Next</div>
              )}
              <TaskNode task={task} />
            </div>
          ))}
        </div>
      )}
    </Region>
  );
}
