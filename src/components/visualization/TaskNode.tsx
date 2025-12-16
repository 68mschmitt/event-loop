import { Task, TaskType, TaskState } from '@/core/types/task';
import { cn } from '@/lib/utils';

interface TaskNodeProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

// Map task types to Tailwind colors
const typeColors: Record<TaskType, string> = {
  [TaskType.SYNC]: 'bg-blue-500',
  [TaskType.TIMER]: 'bg-orange-500',
  [TaskType.MICROTASK]: 'bg-purple-500',
  [TaskType.PROMISE]: 'bg-purple-600',
  [TaskType.ASYNC_CONTINUATION]: 'bg-purple-600',
  [TaskType.FETCH]: 'bg-green-500',
  [TaskType.DOM_EVENT]: 'bg-pink-500',
  [TaskType.RAF]: 'bg-yellow-500',
  [TaskType.INTERVAL]: 'bg-orange-600',
};

// Map task states to text colors
const stateColors: Record<TaskState, string> = {
  [TaskState.CREATED]: 'text-gray-400',
  [TaskState.WAITING_WEBAPI]: 'text-gray-600',
  [TaskState.QUEUED]: 'text-blue-400',
  [TaskState.RUNNING]: 'text-green-400',
  [TaskState.COMPLETED]: 'text-gray-300',
  [TaskState.CANCELED]: 'text-red-400',
};

export function TaskNode({ task, onClick, className }: TaskNodeProps) {
  const colorClass = typeColors[task.type];
  const stateClass = stateColors[task.state];
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg border border-zinc-700 bg-zinc-800 p-3 transition-colors',
        onClick && 'cursor-pointer hover:border-zinc-600',
        className
      )}
    >
      {/* Color indicator */}
      <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-lg', colorClass)} />
      
      {/* Content */}
      <div className="ml-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-zinc-200">{task.label}</span>
          <span className={cn('text-xs font-mono', stateClass)}>
            {task.state}
          </span>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          {task.type} • ID: {task.id.slice(0, 8)}
        </div>
      </div>
    </div>
  );
}
