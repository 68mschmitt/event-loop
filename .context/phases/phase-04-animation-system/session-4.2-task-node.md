# Session 4.2: TaskNode Component with State-Based Animations

## Overview

This session creates the **TaskNode component** - the animated representation of a task in the visualization. Using Framer Motion's declarative API, this component smoothly transitions between visual states as the task moves through its lifecycle. The component uses variants for different states and layout animations for position changes.

## Prerequisites

- Session 4.1 (Animation Coordinator) complete
- Framer Motion installed
- Understanding of Framer Motion variants
- Understanding of layoutId for shared layout animations
- Basic CSS/Tailwind knowledge

## Goals

- [ ] Create TaskNode component with Framer Motion
- [ ] Define visual variants for each task state
- [ ] Implement layoutId for automatic position animations
- [ ] Add state-based styling (colors, borders, shadows)
- [ ] Support different task types with visual indicators
- [ ] Add hover and click interactions
- [ ] Integrate with animation coordinator
- [ ] Ensure accessibility (ARIA labels, keyboard support)

## Files to Create

### `src/components/visualization/TaskNode.tsx`
**Purpose:** Animated task card component
**Exports:** `TaskNode` component

### `src/animations/variants.ts`
**Purpose:** Framer Motion variant definitions
**Exports:** Task state variants, transition configurations

### `src/utils/taskColors.ts`
**Purpose:** Color mapping for task types
**Exports:** Color utility functions

## Type Definitions

### TaskNode Props

```typescript
export interface TaskNodeProps {
  task: Task;
  region: Region;
  onSelect?: (taskId: string) => void;
}
```

## Implementation Specifications

### Framer Motion Variants

**Location:** `src/animations/variants.ts`

```typescript
import { Variants } from 'framer-motion';
import { ANIMATION_DURATION, EASING } from './config';

/**
 * Variants for task lifecycle states.
 */
export const taskVariants: Variants = {
  // Initial state when task is created
  created: {
    opacity: 0,
    scale: 0.8,
    y: -10,
  },

  // Task waiting in Web APIs
  waiting: {
    opacity: 0.6,
    scale: 1,
    y: 0,
    borderColor: 'rgb(156, 163, 175)', // gray-400
  },

  // Task queued and ready to run
  queued: {
    opacity: 1,
    scale: 1,
    y: 0,
    borderColor: 'rgb(59, 130, 246)', // blue-500
  },

  // Task currently executing
  running: {
    opacity: 1,
    scale: 1.05,
    y: 0,
    borderColor: 'rgb(34, 197, 94)', // green-500
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
  },

  // Task completed execution
  completed: {
    opacity: 0.3,
    scale: 0.95,
    y: 10,
    borderColor: 'rgb(107, 114, 128)', // gray-500
  },

  // Hover state
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Default transition configuration for task animations.
 */
export const taskTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

/**
 * Transition for layout animations (position changes).
 */
export const layoutTransition = {
  type: 'spring',
  damping: 30,
  stiffness: 400,
};
```

### Task Color Utilities

**Location:** `src/utils/taskColors.ts`

```typescript
import { TaskType } from '@/core/types';

/**
 * Color palettes for task types.
 */
export const TASK_COLORS = {
  [TaskType.SYNC]: {
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    text: 'text-slate-900',
    accent: 'rgb(100, 116, 139)', // slate-500
  },
  [TaskType.TIMER]: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-900',
    accent: 'rgb(59, 130, 246)', // blue-500
  },
  [TaskType.MICROTASK]: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-900',
    accent: 'rgb(168, 85, 247)', // purple-500
  },
  [TaskType.PROMISE]: {
    bg: 'bg-violet-100',
    border: 'border-violet-400',
    text: 'text-violet-900',
    accent: 'rgb(139, 92, 246)', // violet-500
  },
  [TaskType.ASYNC_CONTINUATION]: {
    bg: 'bg-indigo-100',
    border: 'border-indigo-400',
    text: 'text-indigo-900',
    accent: 'rgb(99, 102, 241)', // indigo-500
  },
  [TaskType.FETCH]: {
    bg: 'bg-cyan-100',
    border: 'border-cyan-400',
    text: 'text-cyan-900',
    accent: 'rgb(6, 182, 212)', // cyan-500
  },
  [TaskType.DOM_EVENT]: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-900',
    accent: 'rgb(245, 158, 11)', // amber-500
  },
  [TaskType.RAF]: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-900',
    accent: 'rgb(16, 185, 129)', // emerald-500
  },
} as const;

/**
 * Get color classes for a task type.
 */
export function getTaskColors(type: TaskType) {
  return TASK_COLORS[type];
}

/**
 * Get accent color (for borders, shadows) for a task type.
 */
export function getTaskAccentColor(type: TaskType): string {
  return TASK_COLORS[type].accent;
}
```

### TaskNode Component

**Location:** `src/components/visualization/TaskNode.tsx`

```typescript
import { motion } from 'framer-motion';
import { Task, TaskState } from '@/core/types';
import { taskVariants, taskTransition, layoutTransition } from '@/animations/variants';
import { getTaskColors } from '@/utils/taskColors';
import { Region } from '@/animations/types';

export interface TaskNodeProps {
  task: Task;
  region: Region;
  onSelect?: (taskId: string) => void;
}

/**
 * Animated task card component.
 * 
 * Uses Framer Motion for state-based animations and layout transitions.
 * Visual appearance changes based on task state and type.
 */
export function TaskNode({ task, region, onSelect }: TaskNodeProps) {
  const colors = getTaskColors(task.type);
  const variant = mapTaskStateToVariant(task.state);

  return (
    <motion.div
      // Layout animation - automatically animate position changes
      layoutId={task.id}
      layout
      transition={layoutTransition}
      
      // State-based animation
      variants={taskVariants}
      initial="created"
      animate={variant}
      whileHover="hover"
      
      // Styling
      className={`
        relative px-3 py-2 rounded-lg border-2
        cursor-pointer select-none
        ${colors.bg} ${colors.border} ${colors.text}
      `}
      
      // Interaction
      onClick={() => onSelect?.(task.id)}
      
      // Accessibility
      role="button"
      tabIndex={0}
      aria-label={`Task ${task.label}, state: ${task.state}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(task.id);
        }
      }}
    >
      {/* Task Type Badge */}
      <div className="flex items-center gap-2 mb-1">
        <TaskTypeBadge type={task.type} />
        <span className="text-xs font-mono opacity-60">#{task.id}</span>
      </div>

      {/* Task Label */}
      <div className="font-medium text-sm">
        {task.label}
      </div>

      {/* Task Metadata */}
      {renderTaskMetadata(task)}

      {/* State Indicator */}
      <div className="absolute top-1 right-1">
        <StateIndicator state={task.state} />
      </div>
    </motion.div>
  );
}

/**
 * Map task state to Framer Motion variant name.
 */
function mapTaskStateToVariant(state: TaskState): string {
  switch (state) {
    case TaskState.CREATED:
      return 'created';
    case TaskState.WAITING_WEBAPI:
      return 'waiting';
    case TaskState.QUEUED:
      return 'queued';
    case TaskState.RUNNING:
      return 'running';
    case TaskState.COMPLETED:
      return 'completed';
    default:
      return 'queued';
  }
}

/**
 * Render task-specific metadata.
 */
function renderTaskMetadata(task: Task) {
  switch (task.type) {
    case 'timer':
      return (
        <div className="text-xs opacity-60 mt-1">
          Delay: {task.delay}ms
        </div>
      );
    case 'fetch':
      return (
        <div className="text-xs opacity-60 mt-1">
          URL: {task.url}
        </div>
      );
    case 'dom-event':
      return (
        <div className="text-xs opacity-60 mt-1">
          Event: {task.eventType}
        </div>
      );
    default:
      return null;
  }
}

/**
 * Task type badge component.
 */
function TaskTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-white/50">
      {type}
    </span>
  );
}

/**
 * State indicator dot.
 */
function StateIndicator({ state }: { state: TaskState }) {
  const color = getStateColor(state);
  
  return (
    <motion.div
      className={`w-2 h-2 rounded-full ${color}`}
      animate={{
        scale: state === TaskState.RUNNING ? [1, 1.2, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: state === TaskState.RUNNING ? Infinity : 0,
      }}
      aria-label={`State: ${state}`}
    />
  );
}

/**
 * Get color for state indicator.
 */
function getStateColor(state: TaskState): string {
  switch (state) {
    case TaskState.CREATED:
      return 'bg-gray-400';
    case TaskState.WAITING_WEBAPI:
      return 'bg-yellow-400';
    case TaskState.QUEUED:
      return 'bg-blue-400';
    case TaskState.RUNNING:
      return 'bg-green-400';
    case TaskState.COMPLETED:
      return 'bg-gray-600';
    default:
      return 'bg-gray-400';
  }
}
```

### Using TaskNode in Regions

**Example:** `src/components/visualization/MacroQueue.tsx`

```typescript
import { motion } from 'framer-motion';
import { useSimulator } from '@/state/hooks';
import { TaskNode } from './TaskNode';

export function MacroQueue() {
  const { state } = useSimulator();
  const { macroQueue } = state;

  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg">
      <h3 className="text-sm font-semibold text-slate-700">
        Macro Task Queue
      </h3>

      <motion.div
        className="flex flex-col gap-2"
        layout
      >
        {macroQueue.length === 0 ? (
          <div className="text-sm text-slate-400 italic py-4">
            No tasks queued
          </div>
        ) : (
          macroQueue.map(task => (
            <TaskNode
              key={task.id}
              task={task}
              region="macro-queue"
            />
          ))
        )}
      </motion.div>
    </div>
  );
}
```

## Success Criteria

- [ ] TaskNode renders with correct styling for task type
- [ ] Component animates smoothly between states
- [ ] layoutId enables automatic position animations
- [ ] Hover state provides visual feedback
- [ ] Click handler triggers selection
- [ ] Keyboard navigation works (Enter/Space)
- [ ] ARIA labels provide accessibility
- [ ] State indicator dot pulses when running
- [ ] Component responds to animation coordinator
- [ ] No layout shift or flashing during transitions

## Test Specifications

### Test: TaskNode renders with correct colors

**Given:** Task of type TIMER
**When:** Component renders
**Then:** Uses blue color scheme

```typescript
import { render, screen } from '@testing-library/react';
import { TaskNode } from './TaskNode';
import { createTimerTask } from '@/test/factories';

test('TaskNode uses correct colors for task type', () => {
  const task = createTimerTask({ id: 'task-1', label: 'Test Timer' });
  
  render(<TaskNode task={task} region="macro-queue" />);
  
  const node = screen.getByRole('button', { name: /Test Timer/ });
  expect(node).toHaveClass('bg-blue-100', 'border-blue-400');
});
```

### Test: TaskNode transitions between states

**Given:** TaskNode with task in QUEUED state
**When:** Task state changes to RUNNING
**Then:** Component animates to running variant

```typescript
import { render, screen } from '@testing-library/react';
import { TaskNode } from './TaskNode';
import { TaskState } from '@/core/types';

test('TaskNode animates when state changes', () => {
  const { rerender } = render(
    <TaskNode 
      task={{ ...task, state: TaskState.QUEUED }} 
      region="macro-queue" 
    />
  );

  const node = screen.getByRole('button');
  expect(node).not.toHaveClass('scale-105'); // Not running state

  rerender(
    <TaskNode 
      task={{ ...task, state: TaskState.RUNNING }} 
      region="macro-queue" 
    />
  );

  // Framer Motion applies inline styles for animations
  // Check that animate prop changes
  expect(node).toBeInTheDocument();
});
```

### Test: TaskNode handles click

**Given:** TaskNode with onSelect callback
**When:** User clicks task
**Then:** Callback fires with task ID

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskNode } from './TaskNode';

test('TaskNode calls onSelect when clicked', async () => {
  const onSelect = vi.fn();
  const task = createTimerTask({ id: 'task-1' });

  render(<TaskNode task={task} region="macro-queue" onSelect={onSelect} />);

  const node = screen.getByRole('button');
  await userEvent.click(node);

  expect(onSelect).toHaveBeenCalledWith('task-1');
});
```

### Test: TaskNode keyboard accessibility

**Given:** TaskNode in document
**When:** User presses Enter key
**Then:** Selection callback fires

```typescript
test('TaskNode responds to Enter key', async () => {
  const onSelect = vi.fn();
  const task = createTimerTask({ id: 'task-1' });

  render(<TaskNode task={task} region="macro-queue" onSelect={onSelect} />);

  const node = screen.getByRole('button');
  node.focus();
  await userEvent.keyboard('{Enter}');

  expect(onSelect).toHaveBeenCalledWith('task-1');
});
```

### Test: State indicator pulses when running

**Given:** Task with RUNNING state
**When:** Component renders
**Then:** State indicator animates

```typescript
test('StateIndicator pulses for running tasks', () => {
  const task = createTimerTask({ state: TaskState.RUNNING });
  
  render(<TaskNode task={task} region="call-stack" />);
  
  const indicator = screen.getByLabelText('State: running');
  expect(indicator).toBeInTheDocument();
  // Framer Motion will apply animation
});
```

## Integration Points

- **Session 4.1**: Animation coordinator triggers state changes
- **Session 4.3**: layoutId enables path-based animations
- **Session 4.4**: Reduced motion affects transition duration
- **Phase 3 UI**: Used in all region components (MacroQueue, MicroQueue, etc.)
- **Phase 5 Controls**: Click handler opens task inspector

## Framer Motion Patterns Used

### 1. Variants
Define named animation states:
```tsx
<motion.div
  variants={taskVariants}
  animate="running"
/>
```

### 2. Layout Animations
Automatic position/size animations:
```tsx
<motion.div layoutId="task-1" layout />
```

### 3. Whiles
Temporary states (hover, tap, drag):
```tsx
<motion.div whileHover={{ scale: 1.05 }} />
```

### 4. Initial
Starting state before animation:
```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
```

## References

- [Framer Motion Variants](https://www.framer.com/motion/animation/#variants)
- [Framer Motion Layout Animations](https://www.framer.com/motion/layout-animations/)
- [Accessible Components](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

## Notes

- **layoutId is critical** - it tells Framer Motion which elements are the same across renders
- Use **GPU-accelerated properties** (transform, opacity) for smooth animations
- **Variants** keep animation logic declarative and maintainable
- **ARIA labels** ensure screen readers announce task state
- State indicator **pulses** only when running to draw attention
- Each task type has **distinct colors** for easy visual identification
