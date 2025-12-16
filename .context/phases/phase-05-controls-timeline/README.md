# Phase 5: Controls & Timeline

## Overview

Phase 5 implements the playback controls and timeline functionality that allow users to control simulation playback, adjust speed, and navigate through simulation history. This phase transforms the simulator from a static step-by-step system into an interactive, explorable visualization.

## Goals

This phase delivers:

1. **Playback Controls** - Play/Pause, Step Forward, Step Back, and Reset buttons with keyboard shortcuts
2. **Speed Control** - Variable playback speed (0.25x - 4x) that affects both step timing and animations
3. **Timeline Scrubber** - Visual timeline with draggable scrubber and event markers for jumping to specific steps

## Sessions

### Session 5.1: Playback Controls
**Duration:** 3-4 hours

Creates the main playback control panel with buttons for Play/Pause, Step Forward, Step Back, and Reset. Implements the `usePlayback` hook that manages automatic playback using `setInterval`, and adds keyboard shortcuts for common actions.

**Key Deliverables:**
- `PlaybackControls` component with all control buttons
- `usePlayback` hook with interval timer management
- Keyboard event handlers (Space, Arrow keys)
- Play state management in UIContext
- Proper cleanup of intervals

**See:** [session-5.1-playback-controls.md](./session-5.1-playback-controls.md)

### Session 5.2: Speed Control and Timing
**Duration:** 3-4 hours

Implements speed control using Radix UI Slider, allowing users to adjust playback speed from 0.25x to 4x. Coordinates speed changes with both the playback interval and animation durations.

**Key Deliverables:**
- `SpeedControl` component with Radix Slider
- Speed state in UIContext (default 1x)
- Dynamic interval calculation based on speed
- Animation timing adjustments
- Speed presets (0.25x, 0.5x, 1x, 2x, 4x)

**See:** [session-5.2-speed-control.md](./session-5.2-speed-control.md)

### Session 5.3: Timeline Scrubber
**Duration:** 4-5 hours

Creates an interactive timeline component with a scrubber for jumping to any point in the simulation history. Displays markers for significant events (enqueues, renders, etc.) and provides visual feedback about the current position.

**Key Deliverables:**
- `Timeline` component with Radix Slider for scrubber
- `TimelineMarker` components for events
- `useTimeline` hook for navigation
- `JUMP_TO_STEP` action in reducer
- Visual indicators for event types
- Hover tooltips showing step details

**See:** [session-5.3-timeline-scrubber.md](./session-5.3-timeline-scrubber.md)

## Architecture

### Data Flow

```
User Interaction → UI Event → Dispatch Action → Update State → UI Re-render
                                                      ↓
                              (If playing) → Interval Tick → Auto-dispatch STEP_FORWARD
```

### State Management

**UIContext State:**
```typescript
interface UIState {
  isPlaying: boolean;      // Whether simulation is auto-advancing
  speed: number;           // Playback speed multiplier (0.25 - 4)
  // ... other UI state
}
```

**Actions:**
```typescript
type UIAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'TOGGLE_PLAYING' };

type SimulatorAction =
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET' }
  | { type: 'JUMP_TO_STEP'; payload: number };
```

### Control Flow: Playing

1. User clicks Play button
2. Dispatch `SET_PLAYING(true)` to UIContext
3. `usePlayback` hook detects `isPlaying === true`
4. Start `setInterval` with calculated interval: `baseInterval / speed`
5. Every interval: dispatch `STEP_FORWARD` to SimulatorContext
6. Simulation advances, animations play at adjusted speed
7. Continues until:
   - User clicks Pause
   - Simulation reaches end
   - User performs other action (scrub, reset)

### Control Flow: Scrubbing

1. User drags timeline scrubber
2. `onChange` handler calculates target step index
3. Dispatch `JUMP_TO_STEP(index)` to SimulatorContext
4. Reducer restores snapshot from history at that index
5. State updates instantly (no animation)
6. UI reflects state at that step

## Component Hierarchy

```
App
├── AppLayout
│   ├── VisualizationCanvas
│   ├── ControlPanel ← NEW IN THIS PHASE
│   │   ├── PlaybackControls
│   │   │   ├── PlayPauseButton
│   │   │   ├── StepBackwardButton
│   │   │   ├── StepForwardButton
│   │   │   └── ResetButton
│   │   └── SpeedControl
│   │       └── Radix Slider
│   ├── Timeline ← NEW IN THIS PHASE
│   │   ├── Radix Slider (scrubber)
│   │   ├── TimelineMarkers
│   │   └── TimelineTooltip
│   └── Panels
```

## Key Technologies

### Radix UI Slider
Used for both speed control and timeline scrubber:

```tsx
import * as Slider from '@radix-ui/react-slider';

<Slider.Root
  value={[speed]}
  onValueChange={([value]) => setSpeed(value)}
  min={0.25}
  max={4}
  step={0.25}
>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb />
</Slider.Root>
```

### Interval Management
Proper cleanup of intervals:

```typescript
useEffect(() => {
  if (!isPlaying) return;
  
  const interval = setInterval(() => {
    dispatch({ type: 'STEP_FORWARD' });
  }, baseInterval / speed);
  
  return () => clearInterval(interval); // Cleanup
}, [isPlaying, speed]);
```

### Keyboard Events
Global keyboard shortcuts:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlaying();
    } else if (e.code === 'ArrowRight') {
      stepForward();
    } else if (e.code === 'ArrowLeft') {
      stepBackward();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Integration with Other Phases

### With Phase 2 (State Management)
- Uses `SimulatorContext` for dispatching step actions
- Uses `UIContext` for play state and speed
- Reads history for timeline scrubbing

### With Phase 4 (Animation System)
- Animations must respect `speed` setting
- Animation duration = `baseDuration / speed`
- Scrubbing disables animations (instant jump)

### With Phase 3 (UI Scaffolding)
- Controls integrated into main layout
- Timeline positioned at bottom of canvas
- Responsive layout for mobile

## Testing Strategy

### Unit Tests
- Test `usePlayback` hook in isolation
- Test interval cleanup
- Test speed calculation
- Test JUMP_TO_STEP reducer logic

### Integration Tests
- Test play → pause → play flow
- Test speed change during playback
- Test scrubbing updates state correctly
- Test keyboard shortcuts work

### E2E Tests
- Load preset → Play → Pause → Step → Reset
- Adjust speed → verify playback rate
- Scrub timeline → verify jump to step
- Keyboard shortcuts → verify actions

## Accessibility Considerations

- **Keyboard Navigation:**
  - Space: Play/Pause
  - Arrow Right: Step Forward
  - Arrow Left: Step Backward
  - R: Reset
  
- **Screen Readers:**
  - Announce play/pause state changes
  - Announce current step when scrubbing
  - Label all buttons with `aria-label`
  
- **Reduced Motion:**
  - Animations disabled/simplified
  - Scrubbing still works
  - Step transitions instant

## Success Criteria

**Phase complete when:**

- [ ] Can play simulation continuously
- [ ] Can pause at any point
- [ ] Can step forward/backward one step at a time
- [ ] Can reset to initial state
- [ ] Can change speed (0.25x - 4x)
- [ ] Speed change affects playback and animations
- [ ] Can drag timeline scrubber to any step
- [ ] Timeline shows markers for events
- [ ] Keyboard shortcuts work
- [ ] All controls are accessible
- [ ] No memory leaks from intervals
- [ ] Tests pass for all three sessions
- [ ] Playback auto-stops at simulation end

## Time Estimate

**Total:** 10-13 hours

- Session 5.1: 3-4 hours
- Session 5.2: 3-4 hours
- Session 5.3: 4-5 hours

## References

- [Data Flow Documentation](../../architecture/data-flow.md)
- [Tech Stack - Radix UI](../../tech-stack.md#radix-ui)
- [Session Summary](../session-summary.md)
- [Radix Slider Documentation](https://www.radix-ui.com/docs/primitives/components/slider)
- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

## Notes

- Interval cleanup is critical to prevent memory leaks
- Speed changes must update both interval and animation config
- Scrubbing should not trigger animations
- Timeline markers should be clickable for quick navigation
- Consider debouncing scrubber onChange for performance
- Play should auto-pause at simulation end
- Reset should also pause playback
