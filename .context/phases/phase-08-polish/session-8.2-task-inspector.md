# Session 8.2: Task Inspector with Lifecycle View

## Overview

This session builds a **task inspector** that provides a detailed view of any task in the simulation. Users can click on a task to see its complete metadata, lifecycle timeline, and relationships with other tasks. This is a powerful debugging and learning tool.

## Prerequisites

- Phase 1 completed (task types defined)
- Phase 2 completed (history system tracks task lifecycle)
- Phase 3 completed (UI scaffolding exists)
- Phase 4 completed (task nodes clickable)
- Task lifecycle tracked throughout simulation

## Goals

- [ ] Create TaskInspector modal/panel component
- [ ] Display all task metadata (type, delay, origin, etc.)
- [ ] Show lifecycle timeline visualization
- [ ] Display parent/child task relationships
- [ ] Show task effects
- [ ] Click task to open inspector
- [ ] Support keyboard navigation (Escape to close)
- [ ] Mobile-responsive layout
- [ ] Link to related tasks

## Files to Create/Modify

### `src/components/panels/TaskInspector/TaskInspector.tsx`
**Purpose:** Main inspector modal component
**Exports:** `TaskInspector`
**Key responsibilities:**
- Modal dialog or side panel
- Display task information sections
- Handle open/close state
- Keyboard interactions

### `src/components/panels/TaskInspector/TaskMetadata.tsx`
**Purpose:** Display task properties
**Exports:** `TaskMetadata`
**Key responsibilities:**
- Show all task properties
- Format values appropriately
- Group related properties
- Handle different task types

### `src/components/panels/TaskInspector/LifecycleTimeline.tsx`
**Purpose:** Visual timeline of task lifecycle
**Exports:** `LifecycleTimeline`
**Key responsibilities:**
- Show all state transitions
- Display timing information
- Indicate current state
- Show queue movements

### `src/components/panels/TaskInspector/RelationshipGraph.tsx`
**Purpose:** Show parent/child relationships
**Exports:** `RelationshipGraph`
**Key responsibilities:**
- Display task tree
- Show origin task
- Show spawned tasks
- Allow navigation to related tasks

### `src/hooks/useTaskLifecycle.ts`
**Purpose:** Extract lifecycle events for a task
**Exports:** `useTaskLifecycle`
**Key responsibilities:**
- Parse history for task events
- Build lifecycle timeline
- Calculate durations
- Identify relationships

### `src/state/actions/ui.ts` (modify)
**Purpose:** Add inspector actions
**Additions:** `OPEN_INSPECTOR`, `CLOSE_INSPECTOR`
**Key responsibilities:**
- Track selected task ID
- Manage inspector visibility

## Type Definitions

```typescript
/**
 * Complete lifecycle of a task.
 */
export interface TaskLifecycle {
  taskId: string;
  task: Task;
  events: LifecycleEvent[];
  duration: number;              // Total time from created to completed
  executionTime: number;         // Time spent in call stack
  waitTime: number;              // Time spent waiting
  parentTask: Task | null;
  childTasks: Task[];
}

/**
 * Single lifecycle event.
 */
export interface LifecycleEvent {
  stepIndex: number;
  timestamp: number;             // Logical time
  state: TaskState;
  location: TaskLocation;
  action: 'created' | 'enqueued' | 'dequeued' | 'started' | 'completed' | 'canceled';
  details?: string;
}

/**
 * Where a task is in the system.
 */
export type TaskLocation = 
  | 'created'
  | 'webapi'
  | 'macro-queue'
  | 'micro-queue'
  | 'raf-queue'
  | 'call-stack'
  | 'completed'
  | 'canceled';

/**
 * Props for TaskInspector.
 */
export interface TaskInspectorProps {
  taskId: string | null;
  onClose: () => void;
  mode?: 'modal' | 'panel';
}

/**
 * Props for TaskMetadata.
 */
export interface TaskMetadataProps {
  task: Task;
  lifecycle: TaskLifecycle;
}

/**
 * Props for LifecycleTimeline.
 */
export interface LifecycleTimelineProps {
  events: LifecycleEvent[];
  currentStepIndex: number;
}

/**
 * Props for RelationshipGraph.
 */
export interface RelationshipGraphProps {
  task: Task;
  parentTask: Task | null;
  childTasks: Task[];
  onTaskClick: (taskId: string) => void;
}
```

## Implementation Specifications

### TaskInspector Component

```typescript
// src/components/panels/TaskInspector/TaskInspector.tsx

export function TaskInspector({
  taskId,
  onClose,
  mode = 'modal'
}: TaskInspectorProps) {
  const { state, history } = useSimulator();
  const lifecycle = useTaskLifecycle(taskId, history);
  
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (taskId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [taskId, onClose]);
  
  if (!taskId || !lifecycle) {
    return null;
  }
  
  const Container = mode === 'modal' ? Modal : Panel;
  
  return (
    <Container
      isOpen={!!taskId}
      onClose={onClose}
      title={`Task: ${lifecycle.task.label}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Overview section */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <TaskMetadata task={lifecycle.task} lifecycle={lifecycle} />
        </section>
        
        {/* Lifecycle section */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Lifecycle</h3>
          <LifecycleTimeline
            events={lifecycle.events}
            currentStepIndex={state.stepIndex}
          />
        </section>
        
        {/* Relationships section */}
        {(lifecycle.parentTask || lifecycle.childTasks.length > 0) && (
          <section>
            <h3 className="text-lg font-semibold mb-2">Relationships</h3>
            <RelationshipGraph
              task={lifecycle.task}
              parentTask={lifecycle.parentTask}
              childTasks={lifecycle.childTasks}
              onTaskClick={(id) => {
                // Open inspector for related task
                // (triggers parent component state update)
              }}
            />
          </section>
        )}
        
        {/* Effects section */}
        {lifecycle.task.effects.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">Effects</h3>
            <TaskEffects effects={lifecycle.task.effects} />
          </section>
        )}
      </div>
    </Container>
  );
}
```

### TaskMetadata Component

```typescript
// src/components/panels/TaskInspector/TaskMetadata.tsx

export function TaskMetadata({ task, lifecycle }: TaskMetadataProps) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      {/* Common properties */}
      <div>
        <dt className="text-sm font-medium text-gray-500">ID</dt>
        <dd className="mt-1 text-sm text-gray-900 font-mono">{task.id}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Type</dt>
        <dd className="mt-1 text-sm text-gray-900">
          <Badge variant={getTaskTypeColor(task.type)}>
            {task.type}
          </Badge>
        </dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">State</dt>
        <dd className="mt-1 text-sm text-gray-900">
          <Badge variant={getTaskStateColor(task.state)}>
            {task.state}
          </Badge>
        </dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Created At</dt>
        <dd className="mt-1 text-sm text-gray-900">{task.createdAt}ms</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Duration</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {lifecycle.duration}ms
          {lifecycle.executionTime > 0 && (
            <span className="text-gray-500 ml-2">
              ({lifecycle.executionTime}ms executing)
            </span>
          )}
        </dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Origin</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {task.origin === 'scenario' ? (
            'Initial scenario'
          ) : (
            <button
              onClick={() => {/* navigate to parent */}}
              className="text-blue-600 hover:underline"
            >
              {task.origin}
            </button>
          )}
        </dd>
      </div>
      
      {/* Type-specific properties */}
      {isTimerTask(task) && (
        <div>
          <dt className="text-sm font-medium text-gray-500">Delay</dt>
          <dd className="mt-1 text-sm text-gray-900">{task.delay}ms</dd>
        </div>
      )}
      
      {isFetchTask(task) && (
        <>
          <div>
            <dt className="text-sm font-medium text-gray-500">URL</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{task.url}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latency</dt>
            <dd className="mt-1 text-sm text-gray-900">{task.latency}ms</dd>
          </div>
        </>
      )}
      
      {isDomEventTask(task) && (
        <div>
          <dt className="text-sm font-medium text-gray-500">Event Type</dt>
          <dd className="mt-1 text-sm text-gray-900">{task.eventType}</dd>
        </div>
      )}
    </dl>
  );
}
```

### LifecycleTimeline Component

```typescript
// src/components/panels/TaskInspector/LifecycleTimeline.tsx

export function LifecycleTimeline({
  events,
  currentStepIndex
}: LifecycleTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical timeline */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className={cn(
              "relative pl-10",
              event.stepIndex === currentStepIndex && "font-semibold"
            )}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-2 w-4 h-4 rounded-full border-2",
                getEventColor(event.action)
              )}
            />
            
            {/* Event details */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {formatEventAction(event.action)}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  → {formatLocation(event.location)}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Step {event.stepIndex} • {event.timestamp}ms
              </div>
            </div>
            
            {event.details && (
              <div className="text-sm text-gray-600 mt-1">
                {event.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getEventColor(action: LifecycleEvent['action']): string {
  switch (action) {
    case 'created': return 'bg-blue-500 border-blue-500';
    case 'enqueued': return 'bg-yellow-500 border-yellow-500';
    case 'started': return 'bg-green-500 border-green-500';
    case 'completed': return 'bg-gray-500 border-gray-500';
    case 'canceled': return 'bg-red-500 border-red-500';
    default: return 'bg-gray-300 border-gray-300';
  }
}

function formatEventAction(action: LifecycleEvent['action']): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatLocation(location: TaskLocation): string {
  return location.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
```

### RelationshipGraph Component

```typescript
// src/components/panels/TaskInspector/RelationshipGraph.tsx

export function RelationshipGraph({
  task,
  parentTask,
  childTasks,
  onTaskClick
}: RelationshipGraphProps) {
  return (
    <div className="space-y-4">
      {/* Parent task */}
      {parentTask && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">
            Parent Task
          </div>
          <TaskCard
            task={parentTask}
            onClick={() => onTaskClick(parentTask.id)}
            compact
          />
        </div>
      )}
      
      {/* Current task */}
      <div>
        <div className="text-sm font-medium text-gray-500 mb-2">
          Current Task
        </div>
        <TaskCard task={task} compact highlighted />
      </div>
      
      {/* Child tasks */}
      {childTasks.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">
            Spawned Tasks ({childTasks.length})
          </div>
          <div className="space-y-2">
            {childTasks.map(child => (
              <TaskCard
                key={child.id}
                task={child}
                onClick={() => onTaskClick(child.id)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### useTaskLifecycle Hook

```typescript
// src/hooks/useTaskLifecycle.ts

export function useTaskLifecycle(
  taskId: string | null,
  history: SimulationSnapshot[]
): TaskLifecycle | null {
  return useMemo(() => {
    if (!taskId || history.length === 0) return null;
    
    const events: LifecycleEvent[] = [];
    let task: Task | null = null;
    let parentTask: Task | null = null;
    const childTasks: Task[] = [];
    
    // Scan history to build lifecycle
    for (let i = 0; i < history.length; i++) {
      const snapshot = history[i];
      const state = snapshot.state;
      
      // Find task in various locations
      const foundTask = findTaskInState(state, taskId);
      
      if (foundTask && !task) {
        task = foundTask;
        
        events.push({
          stepIndex: i,
          timestamp: state.now,
          state: foundTask.state,
          location: 'created',
          action: 'created'
        });
        
        // Find parent
        if (foundTask.origin && foundTask.origin !== 'scenario') {
          parentTask = findTaskInState(state, foundTask.origin);
        }
      }
      
      // Track location changes
      if (foundTask) {
        const location = getTaskLocation(state, taskId);
        const prevLocation = events.length > 0 ? events[events.length - 1].location : null;
        
        if (location !== prevLocation) {
          events.push({
            stepIndex: i,
            timestamp: state.now,
            state: foundTask.state,
            location,
            action: determineAction(prevLocation, location)
          });
        }
      }
      
      // Find child tasks (tasks with this task as origin)
      findTasksWithOrigin(state, taskId).forEach(child => {
        if (!childTasks.find(t => t.id === child.id)) {
          childTasks.push(child);
        }
      });
    }
    
    if (!task) return null;
    
    const duration = calculateDuration(events);
    const executionTime = calculateExecutionTime(events);
    const waitTime = duration - executionTime;
    
    return {
      taskId,
      task,
      events,
      duration,
      executionTime,
      waitTime,
      parentTask,
      childTasks
    };
  }, [taskId, history]);
}

function findTaskInState(state: SimulatorState, taskId: string): Task | null {
  // Check call stack
  const frame = state.callStack.find(f => f.task.id === taskId);
  if (frame) return frame.task;
  
  // Check queues
  const inMacro = state.macroQueue.find(t => t.id === taskId);
  if (inMacro) return inMacro;
  
  const inMicro = state.microQueue.find(t => t.id === taskId);
  if (inMicro) return inMicro;
  
  const inRaf = state.rafQueue.find(t => t.id === taskId);
  if (inRaf) return inRaf;
  
  // Check Web APIs
  for (const op of state.webApis.values()) {
    if (op.payloadTask.id === taskId) {
      return op.payloadTask;
    }
  }
  
  return null;
}

function getTaskLocation(state: SimulatorState, taskId: string): TaskLocation {
  // Similar to findTaskInState but returns location
  if (state.callStack.find(f => f.task.id === taskId)) return 'call-stack';
  if (state.macroQueue.find(t => t.id === taskId)) return 'macro-queue';
  if (state.microQueue.find(t => t.id === taskId)) return 'micro-queue';
  if (state.rafQueue.find(t => t.id === taskId)) return 'raf-queue';
  
  for (const op of state.webApis.values()) {
    if (op.payloadTask.id === taskId) return 'webapi';
  }
  
  return 'completed';
}

function determineAction(
  prevLocation: TaskLocation | null,
  newLocation: TaskLocation
): LifecycleEvent['action'] {
  if (!prevLocation) return 'created';
  if (newLocation === 'call-stack') return 'started';
  if (newLocation === 'completed') return 'completed';
  if (newLocation.includes('queue')) return 'enqueued';
  return 'enqueued';
}

function calculateDuration(events: LifecycleEvent[]): number {
  if (events.length < 2) return 0;
  return events[events.length - 1].timestamp - events[0].timestamp;
}

function calculateExecutionTime(events: LifecycleEvent[]): number {
  let total = 0;
  let startTime = 0;
  let inCallStack = false;
  
  for (const event of events) {
    if (event.location === 'call-stack' && !inCallStack) {
      startTime = event.timestamp;
      inCallStack = true;
    } else if (event.location !== 'call-stack' && inCallStack) {
      total += event.timestamp - startTime;
      inCallStack = false;
    }
  }
  
  return total;
}

function findTasksWithOrigin(state: SimulatorState, originId: string): Task[] {
  const tasks: Task[] = [];
  
  // Check all locations
  state.callStack.forEach(f => {
    if (f.task.origin === originId) tasks.push(f.task);
  });
  
  state.macroQueue.forEach(t => {
    if (t.origin === originId) tasks.push(t);
  });
  
  state.microQueue.forEach(t => {
    if (t.origin === originId) tasks.push(t);
  });
  
  state.rafQueue.forEach(t => {
    if (t.origin === originId) tasks.push(t);
  });
  
  return tasks;
}
```

## TaskInspector UI Layout

```
┌─────────────────────────────────────────┐
│ Task: Promise.then callback         [X] │
├─────────────────────────────────────────┤
│ Overview                                │
│ ┌─────────────────────────────────────┐ │
│ │ ID: task-abc123                     │ │
│ │ Type: [microtask]  State: [completed]│ │
│ │ Created: 0ms       Duration: 5ms    │ │
│ │ Origin: timer-xyz (click to view)   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Lifecycle                               │
│ ┌─────────────────────────────────────┐ │
│ │ ● Created → Created                 │ │
│ │   Step 0 • 0ms                      │ │
│ │ ● Enqueued → Micro Queue            │ │
│ │   Step 1 • 0ms                      │ │
│ │ ● Started → Call Stack              │ │
│ │   Step 3 • 0ms                      │ │
│ │ ● Completed → Completed             │ │
│ │   Step 4 • 5ms                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Relationships                           │
│ ┌─────────────────────────────────────┐ │
│ │ Parent: [setTimeout callback]       │ │
│ │ Spawned: [fetch callback]           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Success Criteria

- [ ] Inspector opens when task is clicked
- [ ] All task metadata displayed correctly
- [ ] Type-specific properties shown for each task type
- [ ] Lifecycle timeline shows all state transitions
- [ ] Timeline indicates current simulation step
- [ ] Parent task link works
- [ ] Child tasks listed and clickable
- [ ] Effects displayed if present
- [ ] Escape key closes inspector
- [ ] Can navigate between related tasks
- [ ] Mobile responsive layout
- [ ] Accessible (keyboard, screen reader)

## Test Specifications

### Test: Extract lifecycle from history
**Given:** History with task moving through states
**When:** useTaskLifecycle() is called
**Then:** Returns lifecycle with all events

```typescript
test('extracts task lifecycle', () => {
  const history = [
    { stepIndex: 0, state: { /* task created */ } },
    { stepIndex: 1, state: { /* task in micro queue */ } },
    { stepIndex: 2, state: { /* task in call stack */ } },
    { stepIndex: 3, state: { /* task completed */ } }
  ];
  
  const lifecycle = useTaskLifecycle('task-1', history);
  
  expect(lifecycle).not.toBeNull();
  expect(lifecycle!.events).toHaveLength(4);
  expect(lifecycle!.events[0].action).toBe('created');
  expect(lifecycle!.events[3].action).toBe('completed');
});
```

### Test: Calculate execution time
**Given:** Task spent 2 steps in call stack
**When:** calculateExecutionTime() is called
**Then:** Returns correct duration

```typescript
test('calculates execution time', () => {
  const events = [
    { location: 'created', timestamp: 0 },
    { location: 'call-stack', timestamp: 10 },
    { location: 'call-stack', timestamp: 15 },
    { location: 'completed', timestamp: 20 }
  ];
  
  const executionTime = calculateExecutionTime(events);
  
  expect(executionTime).toBe(10); // 20 - 10
});
```

### Test: Find child tasks
**Given:** State with tasks having origin field
**When:** findTasksWithOrigin() is called
**Then:** Returns all tasks spawned by parent

```typescript
test('finds child tasks', () => {
  const state = {
    microQueue: [
      { id: 'child1', origin: 'parent1' },
      { id: 'child2', origin: 'parent1' },
      { id: 'unrelated', origin: 'parent2' }
    ],
    // ...
  };
  
  const children = findTasksWithOrigin(state, 'parent1');
  
  expect(children).toHaveLength(2);
  expect(children.map(t => t.id)).toEqual(['child1', 'child2']);
});
```

## Integration Points

- **Phase 1**: Uses Task types
- **Phase 2**: Reads history system
- **Phase 3**: Modal/panel UI
- **Phase 4**: Click handler on TaskNode
- **Session 8.1**: Links from explanation panel

## References

- [Task Types](../phase-01-core-simulator/session-1.1-types.md)
- [History System](../phase-02-state-management/session-2.1-history.md)
- [Modal Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## Notes

- Use React Portal for modal to avoid z-index issues
- Implement focus trap when modal is open
- Show loading state while extracting lifecycle
- Consider virtualization for tasks with many children
- Add "Copy JSON" button for task metadata
- Support deep linking to specific task (URL hash)
