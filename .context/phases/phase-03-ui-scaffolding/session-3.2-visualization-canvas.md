# Session 3.2: Visualization Canvas Regions

## Overview

This session implements all the individual visualization regions that compose the Event Loop canvas. Each region represents a key part of the event loop model: CallStack, WebApis, MacroQueue, MicroQueue, RafQueue, RenderPipeline, and Console. These components read from `SimulatorContext` and display their contents statically (no animations yet—that's Phase 4). The focus is on correct data display, semantic HTML, and responsive grid layout.

## Prerequisites

- Session 3.1 complete (Vite setup, AppLayout exists)
- Phase 2 complete (SimulatorContext available with useSimulator hook)
- Understanding of event loop model (see `reference/event-loop-rules.md`)
- Familiarity with CSS Grid and Flexbox

## Goals

- [ ] Create `Region` base component for consistent region styling
- [ ] Implement `CallStack` component displaying frames
- [ ] Implement `WebApis` component displaying pending operations
- [ ] Implement `MacroQueue` component displaying macrotasks
- [ ] Implement `MicroQueue` component displaying microtasks
- [ ] Implement `RafQueue` component displaying rAF callbacks
- [ ] Implement `RenderPipeline` component showing render state
- [ ] Implement `Console` component displaying log entries
- [ ] Create `TaskNode` component for consistent task card rendering
- [ ] Update `Canvas` component to render all regions in grid layout
- [ ] Ensure responsive layout (stack vertically on mobile)
- [ ] Connect all regions to SimulatorContext

## Files to Create

### `src/components/visualization/Region.tsx`
**Purpose:** Base container component for all regions
**Exports:** `Region` component
**Key responsibilities:**
- Consistent border, padding, background
- Title with optional count badge
- Scrollable content area

### `src/components/visualization/CallStack.tsx`
**Purpose:** Display call stack frames
**Exports:** `CallStack` component
**Key responsibilities:**
- Read `callStack` from SimulatorContext
- Display frames top-to-bottom (top of stack = bottom of visual)
- Show task label, steps remaining

### `src/components/visualization/WebApis.tsx`
**Purpose:** Display pending Web API operations
**Exports:** `WebApis` component
**Key responsibilities:**
- Read `webApis` Map from SimulatorContext
- Display each operation with readyAt time
- Show operation type (timer, fetch, etc.)

### `src/components/visualization/MacroQueue.tsx`
**Purpose:** Display macrotask queue
**Exports:** `MacroQueue` component
**Key responsibilities:**
- Read `macroQueue` from SimulatorContext
- Display tasks in FIFO order
- Front of queue at left (or top on mobile)

### `src/components/visualization/MicroQueue.tsx`
**Purpose:** Display microtask queue
**Exports:** `MicroQueue` component
**Key responsibilities:**
- Read `microQueue` from SimulatorContext
- Display tasks in FIFO order
- Highlight if non-empty (microtasks have priority)

### `src/components/visualization/RafQueue.tsx`
**Purpose:** Display rAF callback queue
**Exports:** `RafQueue` component
**Key responsibilities:**
- Read `rafQueue` from SimulatorContext
- Display callbacks waiting for next frame

### `src/components/visualization/RenderPipeline.tsx`
**Purpose:** Display render pipeline state
**Exports:** `RenderPipeline` component
**Key responsibilities:**
- Read `renderPending` flag from SimulatorContext
- Show whether render is scheduled
- Display `frameCounter` and `lastFrameAt`

### `src/components/visualization/Console.tsx`
**Purpose:** Display console log output
**Exports:** `Console` component
**Key responsibilities:**
- Read `log` array from SimulatorContext
- Display recent log entries (last 20?)
- Show timestamp, message, type

### `src/components/visualization/TaskNode.tsx`
**Purpose:** Consistent task card rendering
**Exports:** `TaskNode` component
**Key responsibilities:**
- Display task label, type, state
- Color-code by task type
- Show badge for task state
- Support onClick for inspection (Phase 8)

### `src/components/visualization/index.ts`
**Purpose:** Barrel export
**Exports:** All visualization components

### `src/components/layout/Canvas.tsx` (modify)
**Purpose:** Update to render all regions
**Changes:**
- Add CSS Grid layout with region placements
- Import and render all visualization components

## Type Definitions

### Region Props
```typescript
interface RegionProps {
  title: string;
  count?: number;           // Optional badge count
  children: React.ReactNode;
  className?: string;       // Additional classes
  emptyMessage?: string;    // Message when no items
}
```

### TaskNode Props
```typescript
interface TaskNodeProps {
  task: Task;
  onClick?: () => void;     // For inspection in Phase 8
  className?: string;
}
```

### Component Props
All region components have no required props (read from context):
```typescript
interface CallStackProps {}
interface WebApisProps {}
interface MacroQueueProps {}
interface MicroQueueProps {}
interface RafQueueProps {}
interface RenderPipelineProps {}
interface ConsoleProps {}
```

## Implementation Specifications

### Region Base Component

```typescript
// src/components/visualization/Region.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // classname utility

interface RegionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function Region({ 
  title, 
  count, 
  children, 
  className,
  emptyMessage = 'Empty'
}: RegionProps) {
  return (
    <div className={cn(
      'rounded-lg border border-zinc-700 bg-zinc-900/50 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-xs font-mono text-zinc-300">
            {count}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 min-h-[120px]">
        {React.Children.count(children) === 0 ? (
          <p className="text-sm text-zinc-500 text-center mt-8">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
```

### TaskNode Component

```typescript
// src/components/visualization/TaskNode.tsx
import React from 'react';
import { Task, TaskType, TaskState } from '@/core/types';
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
        'relative rounded-lg border border-zinc-700 bg-zinc-800 p-3 cursor-pointer hover:border-zinc-600 transition-colors',
        onClick && 'cursor-pointer',
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
```

### CallStack Component

```typescript
// src/components/visualization/CallStack.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function CallStack() {
  const { state } = useSimulator();
  const { callStack } = state;
  
  return (
    <Region 
      title="Call Stack" 
      count={callStack.length}
      emptyMessage="No tasks executing"
    >
      <div className="space-y-2">
        {/* Display bottom-to-top (array reversed) */}
        {[...callStack].reverse().map((frame, idx) => (
          <div key={frame.task.id} className="relative">
            <TaskNode task={frame.task} />
            {/* Steps remaining indicator */}
            <div className="mt-1 text-xs text-zinc-500 font-mono">
              Steps remaining: {frame.stepsRemaining}
            </div>
          </div>
        ))}
      </div>
    </Region>
  );
}
```

### WebApis Component

```typescript
// src/components/visualization/WebApis.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function WebApis() {
  const { state } = useSimulator();
  const { webApis, now } = state;
  
  const operations = Array.from(webApis.values());
  
  return (
    <Region 
      title="Web APIs" 
      count={operations.length}
      emptyMessage="No pending operations"
    >
      <div className="space-y-2">
        {operations.map((op) => (
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
    </Region>
  );
}
```

### MacroQueue Component

```typescript
// src/components/visualization/MacroQueue.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function MacroQueue() {
  const { state } = useSimulator();
  const { macroQueue } = state;
  
  return (
    <Region 
      title="Macrotask Queue" 
      count={macroQueue.length}
      emptyMessage="No macrotasks queued"
    >
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        {macroQueue.map((task, idx) => (
          <div key={task.id} className="flex-shrink-0 w-full sm:w-48">
            {idx === 0 && (
              <div className="text-xs text-blue-400 font-semibold mb-1">← Next</div>
            )}
            <TaskNode task={task} />
          </div>
        ))}
      </div>
    </Region>
  );
}
```

### MicroQueue Component

```typescript
// src/components/visualization/MicroQueue.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function MicroQueue() {
  const { state } = useSimulator();
  const { microQueue } = state;
  
  const hasItems = microQueue.length > 0;
  
  return (
    <Region 
      title="Microtask Queue" 
      count={microQueue.length}
      emptyMessage="No microtasks queued"
      className={hasItems ? 'ring-2 ring-purple-500/50' : undefined}
    >
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        {microQueue.map((task, idx) => (
          <div key={task.id} className="flex-shrink-0 w-full sm:w-48">
            {idx === 0 && (
              <div className="text-xs text-purple-400 font-semibold mb-1">← Next</div>
            )}
            <TaskNode task={task} />
          </div>
        ))}
      </div>
    </Region>
  );
}
```

### RafQueue Component

```typescript
// src/components/visualization/RafQueue.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';
import { TaskNode } from './TaskNode';

export function RafQueue() {
  const { state } = useSimulator();
  const { rafQueue } = state;
  
  return (
    <Region 
      title="rAF Queue" 
      count={rafQueue.length}
      emptyMessage="No rAF callbacks"
    >
      <div className="space-y-2">
        {rafQueue.map((task) => (
          <TaskNode key={task.id} task={task} />
        ))}
      </div>
    </Region>
  );
}
```

### RenderPipeline Component

```typescript
// src/components/visualization/RenderPipeline.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';

export function RenderPipeline() {
  const { state } = useSimulator();
  const { renderPending, frameCounter, lastFrameAt } = state;
  
  return (
    <Region 
      title="Render Pipeline" 
      className={renderPending ? 'ring-2 ring-green-500/50' : undefined}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Status</span>
          <span className={`text-sm font-semibold ${renderPending ? 'text-green-400' : 'text-zinc-500'}`}>
            {renderPending ? 'Pending' : 'Idle'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Frame Count</span>
          <span className="text-sm font-mono text-zinc-300">{frameCounter}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Last Frame</span>
          <span className="text-sm font-mono text-zinc-300">{lastFrameAt}ms</span>
        </div>
      </div>
    </Region>
  );
}
```

### Console Component

```typescript
// src/components/visualization/Console.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';
import { Region } from './Region';

export function Console() {
  const { state } = useSimulator();
  const { log } = state;
  
  // Show last 20 entries
  const recentLogs = log.slice(-20);
  
  return (
    <Region 
      title="Console" 
      count={log.length}
      emptyMessage="No log entries"
    >
      <div className="space-y-1 font-mono text-xs">
        {recentLogs.map((entry, idx) => (
          <div key={idx} className="flex gap-2 text-zinc-400">
            <span className="text-zinc-600">[{entry.timestamp}ms]</span>
            <span className="text-zinc-500">{entry.type}</span>
            <span className="text-zinc-300">{entry.message}</span>
          </div>
        ))}
      </div>
    </Region>
  );
}
```

### Canvas Layout Update

```typescript
// src/components/layout/Canvas.tsx
import React from 'react';
import { CallStack } from '@/components/visualization/CallStack';
import { WebApis } from '@/components/visualization/WebApis';
import { MacroQueue } from '@/components/visualization/MacroQueue';
import { MicroQueue } from '@/components/visualization/MicroQueue';
import { RafQueue } from '@/components/visualization/RafQueue';
import { RenderPipeline } from '@/components/visualization/RenderPipeline';
import { Console } from '@/components/visualization/Console';

export function Canvas() {
  return (
    <div className="h-full p-6">
      {/* Grid layout: 3 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left column */}
        <div className="space-y-4">
          <CallStack />
          <WebApis />
        </div>
        
        {/* Center column */}
        <div className="space-y-4">
          <MacroQueue />
          <MicroQueue />
          <RafQueue />
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          <RenderPipeline />
          <Console />
        </div>
      </div>
    </div>
  );
}
```

### Utility: className helper

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Success Criteria

- [ ] All regions render in Canvas grid layout
- [ ] CallStack displays frames bottom-to-top
- [ ] WebApis shows pending operations with times
- [ ] Queues show tasks in FIFO order
- [ ] RenderPipeline shows pending/idle status
- [ ] Console displays recent log entries
- [ ] TaskNode renders with correct colors for task type
- [ ] Empty states show friendly messages
- [ ] Count badges display correct numbers
- [ ] Responsive: stacks vertically on mobile
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors

## Test Specifications

### Test: CallStack displays frames
**Given:** SimulatorContext with callStack containing 2 frames
**When:** Render CallStack component
**Then:** 2 TaskNodes rendered, bottom frame shown first

```typescript
test('CallStack displays frames bottom-to-top', () => {
  const mockState = {
    callStack: [
      { task: createMockTask('bottom'), stepsRemaining: 1 },
      { task: createMockTask('top'), stepsRemaining: 2 },
    ],
    // ... other state
  };
  
  render(<CallStack />, { wrapper: createMockProvider(mockState) });
  
  const tasks = screen.getAllByText(/bottom|top/);
  expect(tasks[0]).toHaveTextContent('top'); // Reversed
  expect(tasks[1]).toHaveTextContent('bottom');
});
```

### Test: Queue displays tasks
**Given:** State with 3 macrotasks
**When:** Render MacroQueue
**Then:** 3 TaskNodes, first labeled "Next"

```typescript
test('MacroQueue shows next task indicator', () => {
  const mockState = {
    macroQueue: [
      createMockTask('first'),
      createMockTask('second'),
      createMockTask('third'),
    ],
    // ... other state
  };
  
  render(<MacroQueue />, { wrapper: createMockProvider(mockState) });
  
  expect(screen.getByText('← Next')).toBeInTheDocument();
  expect(screen.getAllByText(/Task/)).toHaveLength(3);
});
```

### Test: Empty state shown
**Given:** Empty queue
**When:** Render MicroQueue
**Then:** "No microtasks queued" message

```typescript
test('shows empty state when queue is empty', () => {
  const mockState = {
    microQueue: [],
    // ... other state
  };
  
  render(<MicroQueue />, { wrapper: createMockProvider(mockState) });
  
  expect(screen.getByText('No microtasks queued')).toBeInTheDocument();
});
```

### Test: TaskNode colors
**Given:** Task with type TIMER
**When:** Render TaskNode
**Then:** Background color matches orange-500

```typescript
test('TaskNode renders correct color for type', () => {
  const task = createMockTask('timer', { type: TaskType.TIMER });
  const { container } = render(<TaskNode task={task} />);
  
  const indicator = container.querySelector('.bg-orange-500');
  expect(indicator).toBeInTheDocument();
});
```

### Test: RenderPipeline highlights when pending
**Given:** renderPending = true
**When:** Render RenderPipeline
**Then:** Ring border applied, status = "Pending"

```typescript
test('RenderPipeline highlights when pending', () => {
  const mockState = {
    renderPending: true,
    frameCounter: 10,
    lastFrameAt: 160,
    // ... other state
  };
  
  render(<RenderPipeline />, { wrapper: createMockProvider(mockState) });
  
  expect(screen.getByText('Pending')).toBeInTheDocument();
});
```

### Test: Console displays recent logs
**Given:** Log with 25 entries
**When:** Render Console
**Then:** Only last 20 shown

```typescript
test('Console shows last 20 entries', () => {
  const mockLogs = Array.from({ length: 25 }, (_, i) => ({
    timestamp: i,
    type: 'log',
    message: `Entry ${i}`,
  }));
  
  const mockState = { log: mockLogs, /* ... */ };
  
  render(<Console />, { wrapper: createMockProvider(mockState) });
  
  expect(screen.queryByText('Entry 0')).not.toBeInTheDocument();
  expect(screen.getByText('Entry 24')).toBeInTheDocument();
});
```

## Integration Points

- **Session 3.1**: Uses Canvas component from layout
- **Phase 2**: Uses useSimulator hook from state
- **Phase 4**: TaskNode will gain animation support
- **Phase 8**: TaskNode onClick will open inspector

## References

- [Event Loop Rules](../../reference/event-loop-rules.md)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

## Notes

### Why separate components per region?
- Clear separation of concerns
- Independent testing
- Easy to modify individual regions
- Better code organization

### TaskNode reusability
- Single source of truth for task rendering
- Consistent styling across all regions
- Easy to add animations in Phase 4

### Responsive strategy
- Stack vertically on mobile (< 1024px)
- Horizontal queues become vertical
- All regions remain accessible

### Performance considerations
- No premature optimization (React is fast enough for this)
- Will add React.memo in Phase 4 if needed for animations
