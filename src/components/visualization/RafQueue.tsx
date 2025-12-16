import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';
import type { Task } from '@/core/types/task';

export function RafQueue() {
  const state = useSimulator();
  const { rafQueue } = state;
  
  return (
    <Region 
      title="rAF Queue" 
      count={rafQueue.length}
      emptyMessage="No rAF callbacks"
    >
      {rafQueue.length > 0 && (
        <div className="space-y-2">
          {rafQueue.map((task: Task) => (
            <TaskNode key={task.id} task={task} />
          ))}
        </div>
      )}
    </Region>
  );
}
