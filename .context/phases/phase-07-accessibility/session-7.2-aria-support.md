# Session 7.2: ARIA Support and Screen Reader Accessibility

## Overview

This session adds comprehensive ARIA (Accessible Rich Internet Applications) support to make the Event Loop Visualizer fully accessible to screen reader users. You'll add ARIA labels, roles, properties, and live regions throughout the application to provide meaningful context and announcements for assistive technologies.

## Prerequisites

- Phase 3 complete (UI structure exists)
- Phase 5 complete (controls and timeline exist)
- Session 7.1 complete (keyboard navigation works)
- Understanding of ARIA specifications
- Access to a screen reader for testing (VoiceOver, NVDA, or JAWS)

## Goals

- [ ] Add ARIA labels to all interactive elements
- [ ] Define appropriate ARIA roles for custom components
- [ ] Implement aria-live regions for dynamic content
- [ ] Add screen reader announcements for state changes
- [ ] Label all visualization regions
- [ ] Provide context for task inspector content
- [ ] Add descriptions to complex UI patterns
- [ ] Test with VoiceOver and/or NVDA
- [ ] Ensure semantic HTML where possible
- [ ] Document ARIA patterns used

## Files to Create/Modify

### `src/hooks/useAriaLive.ts`
**Purpose:** Custom hook for announcing messages to screen readers
**Exports:** `useAriaLive` hook
**Key responsibilities:**
- Manage aria-live region
- Queue announcements
- Control announcement timing

### `src/components/common/ScreenReaderOnly.tsx`
**Purpose:** Component for screen reader-only content
**Exports:** `ScreenReaderOnly` component
**Key responsibilities:**
- Hide content visually
- Keep content in accessibility tree

### `src/components/common/AriaLiveRegion.tsx`
**Purpose:** Dedicated aria-live announcement region
**Exports:** `AriaLiveRegion` component
**Key responsibilities:**
- Render polite/assertive announcements
- Auto-clear after timeout

### `src/components/visualization/VisualizationRegion.tsx` (modify)
**Purpose:** Add ARIA labels to visualization regions
**Changes:**
- Add role="region"
- Add aria-label for each region
- Add aria-live for console output

### `src/components/controls/PlaybackControls.tsx` (modify)
**Purpose:** Enhance controls with ARIA
**Changes:**
- Aria-pressed for play/pause
- Aria-disabled for unavailable actions
- Descriptive aria-labels

### `src/components/panels/ExplanationPanel.tsx` (modify)
**Purpose:** Make explanations accessible
**Changes:**
- Add aria-live="polite"
- aria-atomic for complete reads

### `src/components/timeline/TimelineScrubber.tsx` (modify)
**Purpose:** Enhance timeline with ARIA
**Changes:**
- aria-valuenow/min/max for slider
- aria-label for position
- Announce step changes

### `src/components/panels/TaskInspector.tsx` (modify)
**Purpose:** Add ARIA to modal
**Changes:**
- role="dialog"
- aria-modal="true"
- aria-labelledby for title
- aria-describedby for description

## Type Definitions

### useAriaLive Hook

```typescript
type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

interface AriaLiveOptions {
  politeness?: LiveRegionPoliteness;
  clearAfter?: number; // ms before clearing message
  atomic?: boolean;    // Read entire region on change
}

interface AriaLiveHook {
  announce: (message: string, options?: AriaLiveOptions) => void;
  clear: () => void;
}

type UseAriaLive = () => AriaLiveHook;
```

### ARIA Props

```typescript
interface AriaRegionProps {
  role?: 'region' | 'status' | 'alert' | 'log';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
}

interface AriaControlProps {
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-disabled'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}

interface AriaDialogProps {
  role: 'dialog';
  'aria-modal': boolean;
  'aria-labelledby': string;
  'aria-describedby'?: string;
}
```

## Implementation Specifications

### useAriaLive Hook

```typescript
// src/hooks/useAriaLive.ts
import { useCallback, useRef } from 'react';

interface AriaLiveOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
  atomic?: boolean;
}

export function useAriaLive() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Create live region if it doesn't exist
  const ensureLiveRegion = useCallback((politeness: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
      liveRegionRef.current = region;
    }
    return liveRegionRef.current;
  }, []);

  const announce = useCallback(
    (message: string, options: AriaLiveOptions = {}) => {
      const {
        politeness = 'polite',
        clearAfter = 5000,
        atomic = true,
      } = options;

      const region = ensureLiveRegion(politeness);
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', atomic.toString());

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the message
      region.textContent = message;

      // Clear after specified time
      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          if (region) {
            region.textContent = '';
          }
        }, clearAfter);
      }
    },
    [ensureLiveRegion]
  );

  const clear = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { announce, clear };
}
```

### ScreenReaderOnly Component

```typescript
// src/components/common/ScreenReaderOnly.tsx
import { ReactNode } from 'react';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function ScreenReaderOnly({
  children,
  as: Component = 'span',
}: ScreenReaderOnlyProps) {
  return <Component className="sr-only">{children}</Component>;
}

// Ensure this CSS is in globals.css:
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }
```

### AriaLiveRegion Component

```typescript
// src/components/common/AriaLiveRegion.tsx
import { useEffect, useRef } from 'react';

interface AriaLiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
  atomic?: boolean;
}

export function AriaLiveRegion({
  message,
  politeness = 'polite',
  clearAfter = 5000,
  atomic = true,
}: AriaLiveRegionProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (clearAfter > 0 && message) {
      timeoutRef.current = setTimeout(() => {
        // Message will be cleared by next render
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

### Visualization Regions with ARIA

```typescript
// src/components/visualization/VisualizationRegion.tsx (modifications)
interface VisualizationRegionProps {
  type: 'callstack' | 'webapis' | 'queues' | 'render' | 'console';
  children: ReactNode;
}

const regionLabels = {
  callstack: 'Call Stack',
  webapis: 'Web APIs',
  queues: 'Task Queues',
  render: 'Render Pipeline',
  console: 'Console Output',
};

const regionDescriptions = {
  callstack: 'Currently executing synchronous code',
  webapis: 'Browser APIs handling asynchronous operations',
  queues: 'Waiting tasks organized by priority',
  render: 'Visual rendering and layout updates',
  console: 'Console log output from executed code',
};

export function VisualizationRegion({ type, children }: VisualizationRegionProps) {
  return (
    <section
      role="region"
      aria-label={regionLabels[type]}
      aria-describedby={`${type}-description`}
      className={`region-${type}`}
    >
      {/* Screen reader description */}
      <ScreenReaderOnly id={`${type}-description`}>
        {regionDescriptions[type]}
      </ScreenReaderOnly>

      {/* Region title */}
      <h2 className="text-sm font-semibold mb-2 text-zinc-400">
        {regionLabels[type]}
      </h2>

      {/* Region content */}
      {children}
    </section>
  );
}

// Console region with aria-live
export function ConsoleRegion({ logs }: { logs: string[] }) {
  return (
    <section
      role="log"
      aria-label="Console Output"
      aria-live="polite"
      aria-atomic="false"
      className="region-console"
    >
      <h2 className="text-sm font-semibold mb-2 text-zinc-400">Console</h2>
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono text-zinc-300">
            <span aria-label={`Console log ${index + 1}`}>{log}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Playback Controls with Enhanced ARIA

```typescript
// src/components/controls/PlaybackControls.tsx (modifications)
export function PlaybackControls() {
  const { state, dispatch } = useSimulator();
  const { announce } = useAriaLive();

  const isPlaying = state.playbackState === 'playing';
  const canStepBack = state.stepIndex > 0;
  const canStepForward = state.stepIndex < state.history.length - 1;
  const currentStep = state.stepIndex + 1;
  const totalSteps = state.history.length;

  const handlePlay = () => {
    dispatch({ type: 'PLAY' });
    announce('Simulation playing');
  };

  const handlePause = () => {
    dispatch({ type: 'PAUSE' });
    announce('Simulation paused');
  };

  const handleStepForward = () => {
    dispatch({ type: 'STEP_FORWARD' });
    announce(`Stepped forward to step ${currentStep + 1} of ${totalSteps}`);
  };

  const handleStepBackward = () => {
    dispatch({ type: 'STEP_BACKWARD' });
    announce(`Stepped backward to step ${currentStep - 1} of ${totalSteps}`);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    announce('Simulation reset to beginning');
  };

  return (
    <div
      role="group"
      aria-label="Playback controls"
      className="flex items-center gap-2"
    >
      {/* Step backward button */}
      <button
        onClick={handleStepBackward}
        disabled={!canStepBack}
        aria-label="Step backward"
        aria-disabled={!canStepBack}
        className="p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StepBackIcon aria-hidden="true" />
      </button>

      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        aria-pressed={isPlaying}
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isPlaying ? (
          <PauseIcon aria-hidden="true" />
        ) : (
          <PlayIcon aria-hidden="true" />
        )}
        <ScreenReaderOnly>
          {isPlaying ? 'Pause' : 'Play'}
        </ScreenReaderOnly>
      </button>

      {/* Step forward button */}
      <button
        onClick={handleStepForward}
        disabled={!canStepForward}
        aria-label="Step forward"
        aria-disabled={!canStepForward}
        className="p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StepForwardIcon aria-hidden="true" />
      </button>

      {/* Reset button */}
      <button
        onClick={handleReset}
        aria-label="Reset simulation"
        className="ml-4 p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <ResetIcon aria-hidden="true" />
      </button>

      {/* Current step indicator */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="ml-4 text-sm text-zinc-400"
      >
        <ScreenReaderOnly>
          Step {currentStep} of {totalSteps}
        </ScreenReaderOnly>
        <span aria-hidden="true">
          {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
```

### Explanation Panel with ARIA Live

```typescript
// src/components/panels/ExplanationPanel.tsx (modifications)
export function ExplanationPanel() {
  const { state } = useSimulator();
  const explanation = getCurrentExplanation(state);
  const previousExplanationRef = useRef<string>('');

  // Announce when explanation changes
  useEffect(() => {
    if (explanation && explanation !== previousExplanationRef.current) {
      previousExplanationRef.current = explanation;
    }
  }, [explanation]);

  return (
    <section
      role="region"
      aria-label="Step explanation"
      className="p-4 bg-zinc-900 rounded"
    >
      <h3 className="text-lg font-semibold mb-2">What's Happening?</h3>
      
      {/* Live region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="text-zinc-300"
      >
        {explanation || 'No explanation available for this step.'}
      </div>
    </section>
  );
}
```

### Timeline Scrubber with ARIA

```typescript
// src/components/timeline/TimelineScrubber.tsx (modifications)
import * as Slider from '@radix-ui/react-slider';

export function TimelineScrubber() {
  const { state, dispatch } = useSimulator();
  const { announce } = useAriaLive();
  
  const currentStep = state.stepIndex;
  const totalSteps = state.history.length;
  const percentage = Math.round((currentStep / (totalSteps - 1)) * 100);

  const handleValueChange = ([value]: number[]) => {
    dispatch({ type: 'JUMP_TO_STEP', payload: value });
    announce(`Jumped to step ${value + 1} of ${totalSteps}`, { clearAfter: 2000 });
  };

  return (
    <div
      role="group"
      aria-label="Timeline navigation"
      className="flex items-center gap-4 w-full"
    >
      {/* Step indicator */}
      <div role="status" aria-live="off" className="text-sm text-zinc-400 min-w-[100px]">
        <ScreenReaderOnly>
          Step {currentStep + 1} of {totalSteps}, {percentage}% complete
        </ScreenReaderOnly>
        <span aria-hidden="true">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Timeline slider */}
      <Slider.Root
        className="relative flex items-center flex-1 h-5"
        value={[currentStep]}
        min={0}
        max={totalSteps - 1}
        step={1}
        onValueChange={handleValueChange}
        aria-label="Timeline position"
      >
        <Slider.Track className="relative flex-1 h-1 bg-zinc-700 rounded">
          <Slider.Range className="absolute h-full bg-blue-500 rounded" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
          aria-valuemin={0}
          aria-valuemax={totalSteps - 1}
          aria-valuenow={currentStep}
          aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}, ${percentage}% complete`}
        />
      </Slider.Root>
    </div>
  );
}
```

### Task Inspector Modal with ARIA

```typescript
// src/components/panels/TaskInspector.tsx (modifications)
import * as Dialog from '@radix-ui/react-dialog';

export function TaskInspector({ task, onClose }: TaskInspectorProps) {
  const titleId = 'task-inspector-title';
  const descriptionId = 'task-inspector-description';

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full p-6 focus:outline-none"
        >
          {/* Dialog header */}
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title id={titleId} className="text-xl font-semibold">
              Task Details: {task.label}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close task inspector"
              className="p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CloseIcon aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Dialog description */}
          <Dialog.Description id={descriptionId} className="sr-only">
            Detailed information about the {task.type} task including its state,
            timing, and effects.
          </Dialog.Description>

          {/* Task details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-1">Type</h3>
              <p className="text-zinc-200">{task.type}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-1">State</h3>
              <p
                role="status"
                aria-label={`Task state: ${task.state}`}
                className="text-zinc-200"
              >
                {task.state}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-1">
                Created At
              </h3>
              <p className="text-zinc-200">
                <time dateTime={task.createdAt.toString()}>
                  {task.createdAt}ms
                </time>
              </p>
            </div>

            {task.effects.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-1">
                  Effects
                </h3>
                <ul
                  role="list"
                  aria-label="Task effects"
                  className="space-y-2"
                >
                  {task.effects.map((effect, index) => (
                    <li key={index} className="text-zinc-200">
                      <span className="font-mono text-sm">{effect.type}</span>
                      {effect.payload && (
                        <span className="ml-2 text-zinc-400">
                          {JSON.stringify(effect.payload)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Task Node with ARIA

```typescript
// src/components/visualization/TaskNode.tsx (modifications)
export function TaskNode({ task }: TaskNodeProps) {
  const stateLabel = getTaskStateLabel(task.state);
  const typeLabel = getTaskTypeLabel(task.type);

  return (
    <div
      role="article"
      aria-label={`${typeLabel} task: ${task.label}`}
      aria-describedby={`task-${task.id}-details`}
      className={cn('task-node', `task-${task.type}`)}
      tabIndex={0}
    >
      {/* Task label */}
      <div className="font-mono text-sm">{task.label}</div>

      {/* Screen reader details */}
      <ScreenReaderOnly id={`task-${task.id}-details`}>
        State: {stateLabel}. Created at {task.createdAt} milliseconds.
        {task.delay && ` Delay: ${task.delay} milliseconds.`}
      </ScreenReaderOnly>

      {/* Visual state indicator */}
      <div
        className={cn('state-indicator', `state-${task.state}`)}
        aria-hidden="true"
      />
    </div>
  );
}

function getTaskStateLabel(state: TaskState): string {
  const labels: Record<TaskState, string> = {
    [TaskState.CREATED]: 'Created',
    [TaskState.WAITING]: 'Waiting',
    [TaskState.QUEUED]: 'Queued',
    [TaskState.RUNNING]: 'Running',
    [TaskState.COMPLETED]: 'Completed',
  };
  return labels[state];
}

function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    [TaskType.SYNC]: 'Synchronous',
    [TaskType.TIMER]: 'Timer',
    [TaskType.MICROTASK]: 'Microtask',
    [TaskType.PROMISE]: 'Promise',
    [TaskType.FETCH]: 'Fetch',
    [TaskType.EVENT]: 'Event',
    [TaskType.RAF]: 'Request Animation Frame',
  };
  return labels[type];
}
```

### Speed Control with ARIA

```typescript
// src/components/controls/SpeedControl.tsx (modifications)
import * as Slider from '@radix-ui/react-slider';

const speedOptions = [0.25, 0.5, 1, 1.5, 2] as const;

export function SpeedControl() {
  const { state, dispatch } = useSimulator();
  const { announce } = useAriaLive();
  
  const speed = state.playbackSpeed;
  const speedIndex = speedOptions.indexOf(speed);

  const handleSpeedChange = ([index]: number[]) => {
    const newSpeed = speedOptions[index];
    dispatch({ type: 'SET_SPEED', payload: newSpeed });
    announce(`Playback speed set to ${newSpeed}x`);
  };

  return (
    <div
      role="group"
      aria-label="Playback speed control"
      className="flex items-center gap-4"
    >
      <label id="speed-label" className="text-sm text-zinc-400">
        Speed
      </label>

      <Slider.Root
        className="relative flex items-center flex-1 h-5"
        value={[speedIndex]}
        min={0}
        max={speedOptions.length - 1}
        step={1}
        onValueChange={handleSpeedChange}
        aria-labelledby="speed-label"
      >
        <Slider.Track className="relative flex-1 h-1 bg-zinc-700 rounded">
          <Slider.Range className="absolute h-full bg-blue-500 rounded" />
        </Slider.Track>
        <Slider.Thumb
          aria-label="Playback speed"
          aria-valuemin={0}
          aria-valuemax={speedOptions.length - 1}
          aria-valuenow={speedIndex}
          aria-valuetext={`${speed}x speed`}
          className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Slider.Root>

      <div
        role="status"
        aria-live="off"
        className="text-sm text-zinc-400 min-w-[40px]"
      >
        <ScreenReaderOnly>Playback speed: {speed}x</ScreenReaderOnly>
        <span aria-hidden="true">{speed}x</span>
      </div>
    </div>
  );
}
```

## Success Criteria

- [ ] All interactive elements have aria-label or aria-labelledby
- [ ] Visualization regions have role="region" and aria-label
- [ ] Console has role="log" with aria-live="polite"
- [ ] Explanation panel has aria-live="polite" and aria-atomic="true"
- [ ] Play/pause button has aria-pressed state
- [ ] Disabled buttons have aria-disabled="true"
- [ ] Timeline slider has aria-valuenow/min/max/text
- [ ] Task inspector modal has role="dialog" and aria-modal="true"
- [ ] Modal title connected via aria-labelledby
- [ ] State changes announced to screen readers
- [ ] Icons have aria-hidden="true"
- [ ] Screen reader-only text provides context where needed
- [ ] Passes VoiceOver navigation test
- [ ] Passes NVDA navigation test
- [ ] Passes axe-core audit with zero violations
- [ ] All custom components have appropriate ARIA roles

## Test Specifications

### Test: ARIA labels present

```typescript
import { render, screen } from '@testing-library/react';
import { PlaybackControls } from '@/components/controls/PlaybackControls';

test('play button has aria-label', () => {
  render(<PlaybackControls />);
  const playButton = screen.getByRole('button', { name: /play simulation/i });
  expect(playButton).toBeInTheDocument();
});

test('play button has aria-pressed', () => {
  render(<PlaybackControls />);
  const playButton = screen.getByRole('button', { name: /play simulation/i });
  expect(playButton).toHaveAttribute('aria-pressed', 'false');
});
```

### Test: Regions have proper roles

```typescript
test('visualization regions have role and label', () => {
  render(<Canvas />);
  
  expect(screen.getByRole('region', { name: /call stack/i })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: /web apis/i })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: /task queues/i })).toBeInTheDocument();
  expect(screen.getByRole('log', { name: /console output/i })).toBeInTheDocument();
});
```

### Test: Live regions announce changes

```typescript
test('explanation panel announces changes', async () => {
  const { rerender } = render(<ExplanationPanel />);
  
  const liveRegion = screen.getByRole('status');
  expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

  // Trigger step change
  // ...
  
  // Verify announcement
  await waitFor(() => {
    expect(liveRegion).toHaveTextContent(/executing/i);
  });
});
```

### Test: Modal has proper ARIA

```typescript
test('task inspector has dialog role', () => {
  render(<TaskInspector task={mockTask} onClose={vi.fn()} />);
  
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');
  expect(dialog).toHaveAttribute('aria-describedby');
});
```

### Test: Slider has ARIA values

```typescript
test('timeline slider has aria-value attributes', () => {
  render(<TimelineScrubber />);
  
  const slider = screen.getByRole('slider', { name: /timeline position/i });
  expect(slider).toHaveAttribute('aria-valuenow');
  expect(slider).toHaveAttribute('aria-valuemin', '0');
  expect(slider).toHaveAttribute('aria-valuemax');
  expect(slider).toHaveAttribute('aria-valuetext');
});
```

### Test: useAriaLive hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAriaLive } from '@/hooks/useAriaLive';

test('creates live region and announces message', () => {
  const { result } = renderHook(() => useAriaLive());
  
  act(() => {
    result.current.announce('Test message');
  });

  const liveRegion = document.querySelector('[role="status"]');
  expect(liveRegion).toBeInTheDocument();
  expect(liveRegion).toHaveTextContent('Test message');
});

test('clears message after timeout', async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useAriaLive());
  
  act(() => {
    result.current.announce('Test message', { clearAfter: 1000 });
  });

  const liveRegion = document.querySelector('[role="status"]');
  expect(liveRegion).toHaveTextContent('Test message');

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(liveRegion).toHaveTextContent('');
  vi.useRealTimers();
});
```

### Test: Axe accessibility audit

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('app has no accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('modal has no accessibility violations', async () => {
  const { container } = render(
    <TaskInspector task={mockTask} onClose={vi.fn()} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### E2E: Screen reader navigation

```typescript
import { test, expect } from '@playwright/test';

test('screen reader can navigate visualization', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Check for region landmarks
  const callStack = page.getByRole('region', { name: /call stack/i });
  await expect(callStack).toBeVisible();

  const webApis = page.getByRole('region', { name: /web apis/i });
  await expect(webApis).toBeVisible();

  const console = page.getByRole('log', { name: /console/i });
  await expect(console).toBeVisible();
});

test('state changes are announced', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Load preset and play
  // ...

  // Check for aria-live announcements
  const status = page.locator('[role="status"][aria-live="polite"]');
  await expect(status).toHaveText(/playing/i, { timeout: 5000 });
});
```

## Integration Points

- **Session 7.1**: ARIA complements keyboard navigation
- **Phase 5**: Controls get enhanced ARIA properties
- **Session 7.3**: Mobile layout maintains ARIA structure
- **Phase 8**: Dev mode toggle gets ARIA label

## References

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

## Notes

### ARIA Live Regions

Three politeness levels:
- **off**: No announcements
- **polite**: Announce when user is idle (default for most cases)
- **assertive**: Announce immediately (use sparingly, for errors/alerts)

### ARIA Atomic

- `aria-atomic="true"`: Read entire region content
- `aria-atomic="false"`: Read only what changed (default)

Use atomic for short status messages, non-atomic for logs.

### Screen Reader Testing Tips

**VoiceOver (macOS):**
- Enable: Cmd + F5
- Navigate: VO + Arrow keys (VO = Ctrl + Option)
- Interact: VO + Shift + Down
- Rotor: VO + U (lists landmarks, headings, etc.)

**NVDA (Windows):**
- Install from nvaccess.org
- Navigate: Arrow keys
- Elements list: Insert + F7
- Browse/Focus mode: Insert + Spacebar

### When to Use aria-label vs aria-labelledby

- **aria-label**: Simple string label, no visible element
- **aria-labelledby**: Reference to visible element(s) by ID
- **aria-describedby**: Additional description, not the main label

### Common ARIA Mistakes to Avoid

❌ Don't use both role and semantic HTML:
```html
<button role="button">Click me</button> <!-- Redundant -->
```

✅ Semantic HTML has implicit roles:
```html
<button>Click me</button> <!-- Already has button role -->
```

❌ Don't put interactive elements inside other interactive elements:
```html
<button><a href="#">Link</a></button> <!-- Invalid -->
```

✅ Keep interactive elements separate:
```html
<a href="#" role="button">Link Button</a> <!-- If needed -->
```

❌ Don't override semantic roles unnecessarily:
```html
<a href="#" role="button">Link</a> <!-- Prefer <button> -->
```

### Icons and ARIA

Always hide decorative icons from screen readers:
```typescript
<PlayIcon aria-hidden="true" />
```

Ensure text alternative exists elsewhere:
```typescript
<button aria-label="Play simulation">
  <PlayIcon aria-hidden="true" />
</button>
```
