# Session 5.1: Playback Controls

## Overview

This session implements the core playback controls that allow users to play, pause, step through, and reset the simulation. The `PlaybackControls` component provides buttons for all control actions, while the `usePlayback` hook manages automatic playback using interval timers. Keyboard shortcuts enhance usability for power users.

## Prerequisites

- Phase 2 completed (SimulatorContext and UIContext exist)
- Basic UI components from Phase 3 (Button component)
- Reducer actions for `STEP_FORWARD`, `STEP_BACKWARD`, `RESET` exist
- Understanding of `useEffect` cleanup and interval management

## Goals

- [ ] Create `PlaybackControls` component with all control buttons
- [ ] Implement `usePlayback` hook for automatic playback
- [ ] Add interval timer management with proper cleanup
- [ ] Implement keyboard shortcuts for common actions
- [ ] Add play state to UIContext
- [ ] Handle edge cases (playing at end, multiple intervals)
- [ ] Add ARIA labels and accessibility attributes
- [ ] Test all control flows

## Files to Create/Modify

### `src/state/UIContext.tsx` (Modify)
**Purpose:** Add play state to UI state
**Changes:**
- Add `isPlaying: boolean` to UIState
- Add `SET_PLAYING` and `TOGGLE_PLAYING` actions to UIAction
- Update reducer to handle new actions

### `src/state/hooks/usePlayback.ts` (Create)
**Purpose:** Hook for managing automatic playback
**Exports:** `usePlayback` hook
**Key responsibilities:**
- Start/stop interval timer based on `isPlaying` state
- Calculate interval duration from base speed
- Dispatch `STEP_FORWARD` on each interval tick
- Auto-pause when simulation reaches end
- Proper cleanup of intervals

### `src/components/controls/PlaybackControls.tsx` (Create)
**Purpose:** Playback control buttons
**Exports:** `PlaybackControls` component
**Key responsibilities:**
- Render Play/Pause, Step Forward, Step Backward, Reset buttons
- Dispatch appropriate actions on click
- Show correct icon based on play state
- Disable buttons when appropriate (e.g., Step Back at start)

### `src/components/controls/ControlPanel.tsx` (Create)
**Purpose:** Container for all control components
**Exports:** `ControlPanel` component
**Key responsibilities:**
- Layout playback and speed controls
- Provide visual grouping

### `src/hooks/useKeyboardShortcuts.ts` (Create)
**Purpose:** Global keyboard shortcut handler
**Exports:** `useKeyboardShortcuts` hook
**Key responsibilities:**
- Listen for keyboard events
- Dispatch actions for shortcuts
- Prevent default browser behavior where needed

## Type Definitions

### UI State

```typescript
// src/state/UIContext.tsx

interface UIState {
  isPlaying: boolean;
  speed: number;  // Will be used in Session 5.2
  selectedTaskId: string | null;
  reducedMotion: boolean;
  showExplanations: boolean;
  developerMode: boolean;
  currentScenario: string | null;
}

type UIAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'TOGGLE_PLAYING' }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_SELECTED_TASK'; payload: string | null }
  // ... other actions
```

### Hook Return Types

```typescript
// src/state/hooks/usePlayback.ts

interface UsePlaybackReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlaying: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}
```

## Implementation Specifications

### 1. Update UIContext with Play State

```typescript
// src/state/UIContext.tsx

const initialUIState: UIState = {
  isPlaying: false,
  speed: 1,
  selectedTaskId: null,
  reducedMotion: false,
  showExplanations: true,
  developerMode: false,
  currentScenario: null,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    
    case 'TOGGLE_PLAYING':
      return { ...state, isPlaying: !state.isPlaying };
    
    // ... other cases
    
    default:
      return state;
  }
}
```

### 2. Implement usePlayback Hook

```typescript
// src/state/hooks/usePlayback.ts

import { useCallback, useEffect } from 'react';
import { useSimulator } from './useSimulator';
import { useUI } from './useUI';

const BASE_INTERVAL = 1000; // 1000ms between steps at 1x speed

export function usePlayback(): UsePlaybackReturn {
  const { state: simState, dispatch: simDispatch } = useSimulator();
  const { state: uiState, dispatch: uiDispatch } = useUI();
  
  const { isPlaying, speed } = uiState;
  const { stepIndex, history } = simState;
  
  // Calculate interval based on speed (will use speed in Session 5.2)
  const interval = BASE_INTERVAL / speed;
  
  // Determine if we can step in each direction
  const canStepForward = stepIndex < history.length - 1 || !isSimulationComplete(simState);
  const canStepBackward = stepIndex > 0;
  
  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    if (!canStepForward) {
      // Auto-pause at end
      uiDispatch({ type: 'SET_PLAYING', payload: false });
      return;
    }
    
    const timer = setInterval(() => {
      simDispatch({ type: 'STEP_FORWARD' });
    }, interval);
    
    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [isPlaying, interval, canStepForward, simDispatch, uiDispatch]);
  
  // Control functions
  const play = useCallback(() => {
    uiDispatch({ type: 'SET_PLAYING', payload: true });
  }, [uiDispatch]);
  
  const pause = useCallback(() => {
    uiDispatch({ type: 'SET_PLAYING', payload: false });
  }, [uiDispatch]);
  
  const togglePlaying = useCallback(() => {
    uiDispatch({ type: 'TOGGLE_PLAYING' });
  }, [uiDispatch]);
  
  const stepForward = useCallback(() => {
    // Pause if playing
    if (isPlaying) {
      uiDispatch({ type: 'SET_PLAYING', payload: false });
    }
    simDispatch({ type: 'STEP_FORWARD' });
  }, [isPlaying, simDispatch, uiDispatch]);
  
  const stepBackward = useCallback(() => {
    // Pause if playing
    if (isPlaying) {
      uiDispatch({ type: 'SET_PLAYING', payload: false });
    }
    simDispatch({ type: 'STEP_BACKWARD' });
  }, [isPlaying, simDispatch, uiDispatch]);
  
  const reset = useCallback(() => {
    // Always pause on reset
    uiDispatch({ type: 'SET_PLAYING', payload: false });
    simDispatch({ type: 'RESET' });
  }, [simDispatch, uiDispatch]);
  
  return {
    isPlaying,
    play,
    pause,
    togglePlaying,
    stepForward,
    stepBackward,
    reset,
    canStepForward,
    canStepBackward,
  };
}

/**
 * Check if simulation has reached the end.
 */
function isSimulationComplete(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.macroQueue.length === 0 &&
    state.microQueue.length === 0 &&
    state.rafQueue.length === 0 &&
    state.webApis.size === 0
  );
}
```

### 3. Create PlaybackControls Component

```typescript
// src/components/controls/PlaybackControls.tsx

import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { usePlayback } from '@/state/hooks/usePlayback';

export function PlaybackControls() {
  const {
    isPlaying,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    canStepForward,
    canStepBackward,
  } = usePlayback();
  
  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="Playback controls">
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? pause : play}
        disabled={!canStepForward && !isPlaying}
        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white" />
        )}
      </button>
      
      {/* Step Backward Button */}
      <button
        onClick={stepBackward}
        disabled={!canStepBackward}
        className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Step backward"
        title="Step backward (←)"
      >
        <SkipBack className="w-5 h-5 text-white" />
      </button>
      
      {/* Step Forward Button */}
      <button
        onClick={stepForward}
        disabled={!canStepForward}
        className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Step forward"
        title="Step forward (→)"
      >
        <SkipForward className="w-5 h-5 text-white" />
      </button>
      
      {/* Reset Button */}
      <button
        onClick={reset}
        className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
        aria-label="Reset simulation"
        title="Reset (R)"
      >
        <RotateCcw className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
```

### 4. Create ControlPanel Container

```typescript
// src/components/controls/ControlPanel.tsx

import { PlaybackControls } from './PlaybackControls';

export function ControlPanel() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-6">
        <PlaybackControls />
        {/* SpeedControl will be added in Session 5.2 */}
      </div>
      
      <div className="text-sm text-gray-400">
        {/* Step counter */}
      </div>
    </div>
  );
}
```

### 5. Implement Keyboard Shortcuts

```typescript
// src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';
import { usePlayback } from '@/state/hooks/usePlayback';

export function useKeyboardShortcuts() {
  const {
    togglePlaying,
    stepForward,
    stepBackward,
    reset,
  } = usePlayback();
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault(); // Prevent page scroll
          togglePlaying();
          break;
        
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) { // Avoid conflict with browser refresh
            e.preventDefault();
            reset();
          }
          break;
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlaying, stepForward, stepBackward, reset]);
}
```

### 6. Integrate into App

```typescript
// src/App.tsx

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ControlPanel } from '@/components/controls/ControlPanel';

export function App() {
  // Enable keyboard shortcuts globally
  useKeyboardShortcuts();
  
  return (
    <div className="h-screen flex flex-col">
      <ControlPanel />
      <div className="flex-1">
        {/* Visualization canvas */}
      </div>
      {/* Timeline will be added in Session 5.3 */}
    </div>
  );
}
```

## Success Criteria

- [ ] Play button starts automatic playback
- [ ] Pause button stops automatic playback
- [ ] Step Forward advances one step and pauses
- [ ] Step Backward goes back one step and pauses
- [ ] Reset returns to initial state and pauses
- [ ] Playback auto-pauses at simulation end
- [ ] Interval timer is properly cleaned up
- [ ] No multiple intervals running simultaneously
- [ ] Keyboard shortcuts work (Space, Arrows, R)
- [ ] Buttons show correct icon based on state
- [ ] Buttons disable appropriately (e.g., no step back at start)
- [ ] ARIA labels present and correct
- [ ] No memory leaks from intervals

## Test Specifications

### Test: Play starts automatic advancement

```typescript
// src/state/hooks/__tests__/usePlayback.test.ts

import { renderHook, act } from '@testing-library/react';
import { usePlayback } from '../usePlayback';

test('play starts automatic advancement', () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => usePlayback());
  
  act(() => {
    result.current.play();
  });
  
  expect(result.current.isPlaying).toBe(true);
  
  // Fast-forward time
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  
  // Should have dispatched STEP_FORWARD
  // (verify with mock dispatch)
  
  jest.useRealTimers();
});
```

### Test: Pause stops automatic advancement

```typescript
test('pause stops automatic advancement', () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => usePlayback());
  
  // Start playing
  act(() => {
    result.current.play();
  });
  
  // Pause
  act(() => {
    result.current.pause();
  });
  
  expect(result.current.isPlaying).toBe(false);
  
  // Fast-forward time
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  
  // Should NOT have dispatched more STEP_FORWARD
  
  jest.useRealTimers();
});
```

### Test: Interval cleanup on unmount

```typescript
test('interval is cleaned up on unmount', () => {
  jest.useFakeTimers();
  const { result, unmount } = renderHook(() => usePlayback());
  
  act(() => {
    result.current.play();
  });
  
  // Unmount component
  unmount();
  
  // Fast-forward time
  jest.advanceTimersByTime(5000);
  
  // Should NOT dispatch any actions after unmount
  
  jest.useRealTimers();
});
```

### Test: Auto-pause at end

```typescript
test('auto-pauses when simulation reaches end', () => {
  // Mock simulator state with completed simulation
  const { result } = renderHook(() => usePlayback(), {
    wrapper: ({ children }) => (
      <SimulatorProvider initialState={completedSimulationState}>
        {children}
      </SimulatorProvider>
    ),
  });
  
  act(() => {
    result.current.play();
  });
  
  // Should immediately pause
  expect(result.current.isPlaying).toBe(false);
});
```

### Test: Keyboard shortcuts

```typescript
// src/hooks/__tests__/useKeyboardShortcuts.test.tsx

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('Space key toggles playing', async () => {
  const mockToggle = jest.fn();
  // Mock usePlayback hook
  jest.mock('@/state/hooks/usePlayback', () => ({
    usePlayback: () => ({ togglePlaying: mockToggle }),
  }));
  
  render(<TestComponent />);
  
  await userEvent.keyboard(' ');
  
  expect(mockToggle).toHaveBeenCalled();
});

test('Arrow Right steps forward', async () => {
  const mockStepForward = jest.fn();
  // Mock usePlayback hook
  
  render(<TestComponent />);
  
  await userEvent.keyboard('{ArrowRight}');
  
  expect(mockStepForward).toHaveBeenCalled();
});
```

### Test: Component integration

```typescript
// src/components/controls/__tests__/PlaybackControls.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackControls } from '../PlaybackControls';

test('renders all control buttons', () => {
  render(<PlaybackControls />);
  
  expect(screen.getByLabelText(/play simulation/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/step backward/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/reset simulation/i)).toBeInTheDocument();
});

test('play button changes to pause when playing', async () => {
  render(<PlaybackControls />);
  const playButton = screen.getByLabelText(/play simulation/i);
  
  await userEvent.click(playButton);
  
  expect(screen.getByLabelText(/pause simulation/i)).toBeInTheDocument();
});

test('step backward disabled at start', () => {
  // Mock simulator at step 0
  render(<PlaybackControls />);
  
  const stepBackButton = screen.getByLabelText(/step backward/i);
  expect(stepBackButton).toBeDisabled();
});
```

## Integration Points

### With Phase 2 (State Management)
- Uses `SimulatorContext` for dispatching `STEP_FORWARD`, `STEP_BACKWARD`, `RESET`
- Uses `UIContext` for `isPlaying` state
- Reads `stepIndex` and `history` from simulator state

### With Session 5.2 (Speed Control)
- `usePlayback` will read `speed` from UIContext
- Interval calculation: `BASE_INTERVAL / speed`

### With Session 5.3 (Timeline)
- Manual scrubbing should pause playback
- Timeline reflects current step during playback

### With Phase 4 (Animation System)
- Animations play during automatic advancement
- Step forward/backward triggers animations
- Reset resets animation state

## References

- [Data Flow: Playing the Simulation](../../architecture/data-flow.md#playing-the-simulation)
- [React: useEffect Cleanup](https://react.dev/reference/react/useEffect#my-effect-does-something-visual-and-i-see-a-flicker-before-it-runs)
- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [MDN: KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
- [ARIA: toolbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/toolbar_role)

## Notes

- **Interval Cleanup:** Always return cleanup function from `useEffect`
- **Multiple Intervals:** Effect dependencies prevent multiple intervals
- **Auto-pause:** Check `canStepForward` inside effect to auto-pause
- **Pause on Manual Actions:** Step and Reset should pause playback
- **Keyboard Conflicts:** Ignore keyboard events when typing in inputs
- **Space Key:** Prevent default to avoid page scroll
- **Button States:** Use `aria-pressed` for toggle buttons like Play/Pause
- **Icons:** Use Lucide React or similar icon library
