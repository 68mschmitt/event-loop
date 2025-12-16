# Session 5.3: Timeline Scrubber

## Overview

This session implements an interactive timeline component that allows users to visualize the entire simulation history and jump to any point by dragging a scrubber. The timeline displays markers for significant events (enqueues, renders, task completions) and provides visual feedback about the current simulation step.

## Prerequisites

- Session 5.1 completed (playback controls exist)
- Session 5.2 completed (speed control exists)
- Phase 2 completed (history system with snapshots)
- Understanding of Radix UI Slider
- Basic understanding of data visualization principles

## Goals

- [ ] Create `Timeline` component with Radix Slider for scrubbing
- [ ] Implement `JUMP_TO_STEP` action in simulator reducer
- [ ] Create `TimelineMarker` components for events
- [ ] Implement `useTimeline` hook for navigation
- [ ] Display step counter and total steps
- [ ] Add hover tooltips for timeline markers
- [ ] Pause playback when scrubbing
- [ ] Add keyboard navigation (Home, End, PageUp, PageDown)
- [ ] Test scrubbing and navigation

## Files to Create/Modify

### `src/state/reducers/simulator.ts` (Modify)
**Purpose:** Add JUMP_TO_STEP action
**Changes:**
- Add `JUMP_TO_STEP` action type
- Implement reducer case to restore snapshot

### `src/state/actions/simulator.ts` (Modify)
**Purpose:** Add JUMP_TO_STEP action creator
**Changes:**
- Export `jumpToStep(index: number)` action creator

### `src/components/timeline/Timeline.tsx` (Create)
**Purpose:** Main timeline component with scrubber
**Exports:** `Timeline` component
**Key responsibilities:**
- Render Radix Slider for scrubbing
- Display current step / total steps
- Render timeline markers
- Handle scrubbing (dispatch JUMP_TO_STEP)
- Pause playback when scrubbing starts

### `src/components/timeline/TimelineMarker.tsx` (Create)
**Purpose:** Visual marker for timeline events
**Exports:** `TimelineMarker` component
**Key responsibilities:**
- Render marker at specific position
- Show tooltip on hover with event details
- Color-code by event type

### `src/state/hooks/useTimeline.ts` (Create)
**Purpose:** Hook for timeline navigation
**Exports:** `useTimeline` hook
**Key responsibilities:**
- Provide jumpToStep function
- Calculate timeline positions
- Extract timeline events from history

### `src/components/timeline/TimelineTooltip.tsx` (Create)
**Purpose:** Tooltip for timeline markers
**Exports:** `TimelineTooltip` component
**Key responsibilities:**
- Display event details on hover
- Show step number, event type, task info

## Type Definitions

### Timeline Event Types

```typescript
// src/components/timeline/types.ts

export enum TimelineEventType {
  ENQUEUE = 'enqueue',
  DEQUEUE = 'dequeue',
  RENDER = 'render',
  TASK_START = 'task-start',
  TASK_COMPLETE = 'task-complete',
}

export interface TimelineEvent {
  stepIndex: number;
  type: TimelineEventType;
  label: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineMarkerProps {
  event: TimelineEvent;
  position: number;  // 0-100 percentage along timeline
  isActive: boolean; // Whether this is the current step
}
```

### Simulator Actions

```typescript
// src/state/actions/simulator.ts

export type SimulatorAction =
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET' }
  | { type: 'JUMP_TO_STEP'; payload: number }  // NEW
  | { type: 'LOAD_SCENARIO'; payload: string };
```

## Implementation Specifications

### 1. Add JUMP_TO_STEP Action to Reducer

```typescript
// src/state/reducers/simulator.ts

function simulatorReducer(
  state: SimulatorState & { history: SimulationSnapshot[] },
  action: SimulatorAction
): SimulatorState & { history: SimulationSnapshot[] } {
  switch (action.type) {
    case 'JUMP_TO_STEP': {
      const targetIndex = action.payload;
      
      // Validate index
      if (targetIndex < 0 || targetIndex >= state.history.length) {
        console.warn(`Invalid step index: ${targetIndex}`);
        return state;
      }
      
      // Restore snapshot from history
      const snapshot = state.history[targetIndex];
      
      return {
        ...snapshot.state,
        history: state.history, // Preserve history
      };
    }
    
    // ... other cases
    
    default:
      return state;
  }
}
```

### 2. Create useTimeline Hook

```typescript
// src/state/hooks/useTimeline.ts

import { useCallback, useMemo } from 'react';
import { useSimulator } from './useSimulator';
import { useUI } from './useUI';
import { TimelineEvent, TimelineEventType } from '@/components/timeline/types';

export interface UseTimelineReturn {
  currentStep: number;
  totalSteps: number;
  jumpToStep: (index: number) => void;
  events: TimelineEvent[];
  canJumpToStep: (index: number) => boolean;
}

export function useTimeline(): UseTimelineReturn {
  const { state: simState, dispatch: simDispatch } = useSimulator();
  const { dispatch: uiDispatch } = useUI();
  
  const { stepIndex, history } = simState;
  const currentStep = stepIndex;
  const totalSteps = history.length;
  
  // Extract events from history
  const events = useMemo(() => {
    return extractTimelineEvents(history);
  }, [history]);
  
  // Jump to specific step
  const jumpToStep = useCallback((index: number) => {
    // Pause playback when scrubbing
    uiDispatch({ type: 'SET_PLAYING', payload: false });
    
    // Jump to step
    simDispatch({ type: 'JUMP_TO_STEP', payload: index });
  }, [simDispatch, uiDispatch]);
  
  const canJumpToStep = useCallback((index: number) => {
    return index >= 0 && index < totalSteps;
  }, [totalSteps]);
  
  return {
    currentStep,
    totalSteps,
    jumpToStep,
    events,
    canJumpToStep,
  };
}

/**
 * Extract timeline events from history snapshots.
 */
function extractTimelineEvents(history: SimulationSnapshot[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  for (let i = 0; i < history.length; i++) {
    const snapshot = history[i];
    const state = snapshot.state;
    
    // Check for significant events in this step
    
    // Renders
    if (state.frameCounter > (history[i - 1]?.state.frameCounter ?? 0)) {
      events.push({
        stepIndex: i,
        type: TimelineEventType.RENDER,
        label: `Render frame ${state.frameCounter}`,
      });
    }
    
    // New tasks enqueued (check log entries)
    const enqueueEntries = state.log.filter(
      (entry) => entry.type === 'enqueue' && entry.timestamp === state.now
    );
    
    enqueueEntries.forEach((entry) => {
      events.push({
        stepIndex: i,
        type: TimelineEventType.ENQUEUE,
        label: entry.message,
        taskId: entry.taskId,
        metadata: entry.metadata,
      });
    });
    
    // Task completions
    const completeEntries = state.log.filter(
      (entry) => entry.type === 'task-complete' && entry.timestamp === state.now
    );
    
    completeEntries.forEach((entry) => {
      events.push({
        stepIndex: i,
        type: TimelineEventType.TASK_COMPLETE,
        label: entry.message,
        taskId: entry.taskId,
        metadata: entry.metadata,
      });
    });
  }
  
  return events;
}
```

### 3. Create Timeline Component

```typescript
// src/components/timeline/Timeline.tsx

import * as Slider from '@radix-ui/react-slider';
import { useTimeline } from '@/state/hooks/useTimeline';
import { TimelineMarker } from './TimelineMarker';

export function Timeline() {
  const {
    currentStep,
    totalSteps,
    jumpToStep,
    events,
  } = useTimeline();
  
  const handleValueChange = (values: number[]) => {
    jumpToStep(values[0]);
  };
  
  // Calculate marker positions (0-100%)
  const getMarkerPosition = (stepIndex: number): number => {
    if (totalSteps <= 1) return 0;
    return (stepIndex / (totalSteps - 1)) * 100;
  };
  
  return (
    <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Timeline</h3>
        <div className="text-sm text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>
      
      {/* Timeline Track */}
      <div className="relative">
        {/* Event Markers (behind slider) */}
        <div className="absolute inset-0 pointer-events-none">
          {events.map((event, index) => (
            <TimelineMarker
              key={`${event.stepIndex}-${index}`}
              event={event}
              position={getMarkerPosition(event.stepIndex)}
              isActive={event.stepIndex === currentStep}
            />
          ))}
        </div>
        
        {/* Slider */}
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-10"
          value={[currentStep]}
          onValueChange={handleValueChange}
          min={0}
          max={Math.max(0, totalSteps - 1)}
          step={1}
          aria-label="Timeline scrubber"
        >
          <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
          </Slider.Track>
          
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-grab active:cursor-grabbing"
            aria-label="Timeline position"
          />
        </Slider.Root>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Enqueue</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Render</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}
```

### 4. Create TimelineMarker Component

```typescript
// src/components/timeline/TimelineMarker.tsx

import * as Tooltip from '@radix-ui/react-tooltip';
import { TimelineEvent, TimelineEventType } from './types';

export interface TimelineMarkerProps {
  event: TimelineEvent;
  position: number;  // 0-100 percentage
  isActive: boolean;
}

const EVENT_COLORS = {
  [TimelineEventType.ENQUEUE]: 'bg-green-500',
  [TimelineEventType.DEQUEUE]: 'bg-yellow-500',
  [TimelineEventType.RENDER]: 'bg-purple-500',
  [TimelineEventType.TASK_START]: 'bg-orange-500',
  [TimelineEventType.TASK_COMPLETE]: 'bg-blue-500',
};

export function TimelineMarker({ event, position, isActive }: TimelineMarkerProps) {
  const color = EVENT_COLORS[event.type];
  
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`
              absolute top-1/2 -translate-y-1/2 -translate-x-1/2
              w-2 h-2 rounded-full
              ${color}
              ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}
              pointer-events-auto cursor-pointer
              hover:scale-150 transition-transform
            `}
            style={{ left: `${position}%` }}
          />
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-xs max-w-xs"
            sideOffset={5}
          >
            <div className="font-medium mb-1">{event.label}</div>
            <div className="text-gray-400">Step {event.stepIndex + 1}</div>
            {event.taskId && (
              <div className="text-gray-400 mt-1">Task: {event.taskId}</div>
            )}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

### 5. Keyboard Navigation

```typescript
// src/hooks/useKeyboardShortcuts.ts (Modify)

import { useTimeline } from '@/state/hooks/useTimeline';

export function useKeyboardShortcuts() {
  const playback = usePlayback();
  const timeline = useTimeline();
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.code) {
        // Existing shortcuts
        case 'Space':
          e.preventDefault();
          playback.togglePlaying();
          break;
        
        // New timeline shortcuts
        case 'Home':
          e.preventDefault();
          timeline.jumpToStep(0);
          break;
        
        case 'End':
          e.preventDefault();
          timeline.jumpToStep(timeline.totalSteps - 1);
          break;
        
        case 'PageUp':
          e.preventDefault();
          timeline.jumpToStep(Math.max(0, timeline.currentStep - 10));
          break;
        
        case 'PageDown':
          e.preventDefault();
          timeline.jumpToStep(
            Math.min(timeline.totalSteps - 1, timeline.currentStep + 10)
          );
          break;
        
        // ... other shortcuts
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback, timeline]);
}
```

### 6. Integrate Timeline into Layout

```typescript
// src/App.tsx

import { Timeline } from '@/components/timeline/Timeline';

export function App() {
  useKeyboardShortcuts();
  
  return (
    <div className="h-screen flex flex-col">
      <ControlPanel />
      
      <div className="flex-1">
        {/* Visualization canvas */}
      </div>
      
      <Timeline />  {/* Add timeline at bottom */}
    </div>
  );
}
```

## Success Criteria

- [ ] Timeline renders at bottom of screen
- [ ] Scrubber reflects current step position
- [ ] Can drag scrubber to jump to any step
- [ ] Scrubbing pauses playback
- [ ] Timeline markers display for events
- [ ] Marker colors match event types
- [ ] Hover tooltips show event details
- [ ] Current step marker highlighted
- [ ] Step counter displays correctly
- [ ] Keyboard shortcuts work (Home, End, PageUp, PageDown)
- [ ] Scrubbing updates state instantly (no animation)
- [ ] No performance issues with many events
- [ ] Timeline is accessible (keyboard navigation)

## Test Specifications

### Test: JUMP_TO_STEP restores snapshot

```typescript
// src/state/reducers/__tests__/simulator.test.ts

test('JUMP_TO_STEP restores snapshot from history', () => {
  const history = [
    { stepIndex: 0, state: initialState },
    { stepIndex: 1, state: stateAfterStep1 },
    { stepIndex: 2, state: stateAfterStep2 },
  ];
  
  const state = { ...stateAfterStep2, history };
  
  const action = { type: 'JUMP_TO_STEP', payload: 1 };
  const newState = simulatorReducer(state, action);
  
  expect(newState.stepIndex).toBe(1);
  expect(newState).toMatchObject(stateAfterStep1);
  expect(newState.history).toBe(history); // History preserved
});
```

### Test: Scrubbing pauses playback

```typescript
// src/components/timeline/__tests__/Timeline.test.tsx

test('scrubbing pauses playback', async () => {
  const { container } = render(<Timeline />);
  
  // Start playing
  act(() => {
    playback.play();
  });
  
  expect(playback.isPlaying).toBe(true);
  
  // Drag scrubber
  const slider = screen.getByLabelText(/timeline scrubber/i);
  // Simulate drag (implementation depends on testing approach)
  
  // Should be paused
  expect(playback.isPlaying).toBe(false);
});
```

### Test: Timeline extracts events correctly

```typescript
// src/state/hooks/__tests__/useTimeline.test.ts

test('extracts timeline events from history', () => {
  const history = [
    {
      stepIndex: 0,
      state: {
        ...initialState,
        log: [{ type: 'enqueue', message: 'Enqueued task', timestamp: 0 }],
      },
    },
    {
      stepIndex: 1,
      state: {
        ...initialState,
        frameCounter: 1,
        log: [{ type: 'render', message: 'Render', timestamp: 16 }],
      },
    },
  ];
  
  const events = extractTimelineEvents(history);
  
  expect(events).toHaveLength(2);
  expect(events[0].type).toBe(TimelineEventType.ENQUEUE);
  expect(events[1].type).toBe(TimelineEventType.RENDER);
});
```

### Test: Marker tooltips display on hover

```typescript
test('marker tooltips display on hover', async () => {
  const event: TimelineEvent = {
    stepIndex: 5,
    type: TimelineEventType.ENQUEUE,
    label: 'Enqueued setTimeout',
    taskId: 'task-1',
  };
  
  render(<TimelineMarker event={event} position={50} isActive={false} />);
  
  const marker = screen.getByRole('button'); // Tooltip trigger
  
  await userEvent.hover(marker);
  
  expect(await screen.findByText('Enqueued setTimeout')).toBeInTheDocument();
  expect(screen.getByText('Step 6')).toBeInTheDocument();
});
```

### Test: Keyboard navigation

```typescript
test('Home key jumps to start', () => {
  const { result } = renderHook(() => useTimeline());
  
  // Jump to middle
  act(() => {
    result.current.jumpToStep(5);
  });
  
  // Press Home
  act(() => {
    fireEvent.keyDown(window, { code: 'Home' });
  });
  
  expect(result.current.currentStep).toBe(0);
});

test('End key jumps to end', () => {
  const { result } = renderHook(() => useTimeline());
  
  act(() => {
    fireEvent.keyDown(window, { code: 'End' });
  });
  
  expect(result.current.currentStep).toBe(result.current.totalSteps - 1);
});
```

## Integration Points

### With Session 5.1 (Playback Controls)
- Scrubbing pauses playback
- Timeline updates during playback
- Step counter syncs with playback

### With Session 5.2 (Speed Control)
- Speed doesn't affect scrubbing (instant)
- Can scrub while any speed is set

### With Phase 2 (State Management)
- Uses history from SimulatorContext
- `JUMP_TO_STEP` action restores snapshots
- No new snapshots created when scrubbing

### With Phase 4 (Animation System)
- Scrubbing disables animations (instant transition)
- Animation coordinator skips animations on JUMP_TO_STEP
- State change is instant, not animated

## References

- [Radix UI Slider Documentation](https://www.radix-ui.com/docs/primitives/components/slider)
- [Radix UI Tooltip Documentation](https://www.radix-ui.com/docs/primitives/components/tooltip)
- [Data Flow: Scrubbing Timeline](../../architecture/data-flow.md#scrubbing-timeline)
- [History System](../phase-02-state-management/session-2.1-history.md)
- [ARIA: slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role)

## Notes

### Timeline Position Calculation
- Position = `(stepIndex / (totalSteps - 1)) * 100`
- Handles edge case of single step (totalSteps = 1)
- Percentage used for CSS left positioning

### Event Extraction
- Extract from snapshot logs
- Look for significant events (enqueue, render, complete)
- May have multiple events per step
- Events stored with step index for positioning

### Performance Considerations
- Limit event extraction (maybe only show key events)
- Debounce scrubber onChange if needed
- Use `useMemo` for event extraction
- Virtualize markers if > 1000 steps

### Scrubbing Behavior
- Should pause playback when user starts dragging
- Should NOT resume playback when user releases
- User must click Play to resume
- Instant state update (no animation)

### Marker Interactions
- Hovering shows tooltip
- Clicking marker jumps to that step
- Active marker (current step) has highlight ring
- Markers scale on hover for better click target

### Keyboard Shortcuts
- **Home:** Jump to first step
- **End:** Jump to last step
- **PageUp:** Jump back 10 steps
- **PageDown:** Jump forward 10 steps
- Arrow keys already used for single step (from Session 5.1)

### Accessibility
- Slider has `aria-label`
- Current position announced by screen readers
- Markers are focusable and keyboard-navigable
- Tooltips provide context for screen reader users
- Step counter provides orientation
