import { motion, HTMLMotionProps } from 'framer-motion';
import { Task, TaskState } from '@/core/types/task';
import { cn } from '@/lib/utils';
import { getTaskColors, getStateOpacity, getTaskTypeLabel } from '@/utils/taskColors';
import { taskNodeVariants, pulseVariants, stateTransition } from '@/animations/variants';

interface TaskNodeProps extends Omit<HTMLMotionProps<'div'>, 'onClick'> {
  task: Task;
  onClick?: () => void;
  className?: string;
  layoutId?: string;
  isAnimating?: boolean;
}

// Map task states to display labels
const stateLabels: Record<TaskState, string> = {
  [TaskState.CREATED]: 'Created',
  [TaskState.WAITING_WEBAPI]: 'Waiting',
  [TaskState.QUEUED]: 'Queued',
  [TaskState.RUNNING]: 'Running',
  [TaskState.COMPLETED]: 'Done',
  [TaskState.CANCELED]: 'Canceled',
};

export function TaskNode({ 
  task, 
  onClick, 
  className,
  layoutId,
  isAnimating = false,
  ...motionProps 
}: TaskNodeProps) {
  const colors = getTaskColors(task.type);
  const stateOpacity = getStateOpacity(task.state);
  const typeLabel = getTaskTypeLabel(task.type);
  const stateLabel = stateLabels[task.state];
  
  // Determine animation variant based on task state
  const getAnimationVariant = () => {
    switch (task.state) {
      case TaskState.RUNNING:
        return 'running';
      case TaskState.COMPLETED:
        return 'completed';
      case TaskState.CANCELED:
        return 'error';
      default:
        return 'queued';
    }
  };

  const isRunning = task.state === TaskState.RUNNING;

  return (
    <motion.div
      layoutId={layoutId || `task-${task.id}`}
      onClick={onClick}
      className={cn(
        'relative rounded-lg border p-3 shadow-md',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        stateOpacity,
        className
      )}
      variants={taskNodeVariants}
      animate={getAnimationVariant()}
      initial="hidden"
      exit="hidden"
      transition={stateTransition}
      {...(onClick && {
        whileHover: { scale: 1.03, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' },
        whileTap: { scale: 0.98 }
      })}
      {...motionProps}
    >
      {/* Color indicator bar */}
      <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-lg', colors.bg)} />
      
      {/* Pulse indicator for running tasks */}
      {isRunning && (
        <motion.div
          className={cn(
            'absolute -top-1 -right-1 w-3 h-3 rounded-full',
            colors.accent
          )}
          variants={pulseVariants}
          initial="initial"
          animate="pulse"
        />
      )}
      
      {/* Content */}
      <div className="ml-3">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('text-sm font-medium', colors.text)}>
            {task.label}
          </span>
          <span 
            className={cn(
              'text-xs font-mono px-1.5 py-0.5 rounded',
              isRunning && 'bg-green-900/30 text-green-300',
              task.state === TaskState.COMPLETED && 'bg-gray-700/30 text-gray-400',
              task.state === TaskState.QUEUED && 'bg-blue-900/30 text-blue-300',
              task.state === TaskState.WAITING_WEBAPI && 'bg-yellow-900/30 text-yellow-300',
              task.state === TaskState.CREATED && 'bg-gray-600/30 text-gray-400',
              task.state === TaskState.CANCELED && 'bg-red-900/30 text-red-300'
            )}
          >
            {stateLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className={cn('px-1.5 py-0.5 rounded', colors.bg, colors.text)}>
            {typeLabel}
          </span>
          <span className="text-zinc-600">•</span>
          <span>{task.id.slice(0, 8)}</span>
        </div>
        
        {/* Show duration for running tasks */}
        {isRunning && task.durationSteps > 1 && (
          <div className="mt-1 text-xs text-zinc-500">
            Steps: {task.durationSteps}
          </div>
        )}
      </div>
    </motion.div>
  );
}
