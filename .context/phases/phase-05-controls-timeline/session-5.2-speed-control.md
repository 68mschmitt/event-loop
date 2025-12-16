# Session 5.2: Speed Control and Timing

## Overview

This session implements variable playback speed control using Radix UI Slider, allowing users to adjust simulation speed from 0.25x (slow motion) to 4x (fast forward). The speed setting affects both the playback interval timing and animation durations, ensuring smooth synchronized playback at any speed.

## Prerequisites

- Session 5.1 completed (`usePlayback` hook and PlaybackControls exist)
- UIContext has `speed` field in state
- Animation system from Phase 4 supports dynamic timing
- Understanding of Radix UI Slider component

## Goals

- [ ] Create `SpeedControl` component with Radix Slider
- [ ] Add speed state to UIContext (if not already present)
- [ ] Update `usePlayback` to use speed for interval calculation
- [ ] Coordinate speed with animation system
- [ ] Add speed preset buttons (0.25x, 0.5x, 1x, 2x, 4x)
- [ ] Display current speed value
- [ ] Add accessibility labels
- [ ] Test speed changes during playback

## Files to Create/Modify

### `src/state/UIContext.tsx` (Modify)
**Purpose:** Ensure speed state exists
**Changes:**
- Add `speed: number` to UIState (default: 1)
- Add `SET_SPEED` action if not present
- Update reducer

### `src/components/controls/SpeedControl.tsx` (Create)
**Purpose:** Speed control slider and presets
**Exports:** `SpeedControl` component
**Key responsibilities:**
- Render Radix Slider for speed selection
- Display current speed value
- Provide preset buttons for common speeds
- Dispatch `SET_SPEED` action

### `src/state/hooks/usePlayback.ts` (Modify)
**Purpose:** Use speed for interval calculation
**Changes:**
- Read `speed` from UIContext
- Calculate interval: `BASE_INTERVAL / speed`
- Update effect dependencies

### `src/animations/config.ts` (Modify)
**Purpose:** Export base animation duration
**Changes:**
- Export `BASE_ANIMATION_DURATION` constant
- Document how to calculate adjusted duration

### `src/animations/coordinator.ts` (Modify)
**Purpose:** Apply speed to animation durations
**Changes:**
- Read `speed` from UIContext
- Calculate animation duration: `BASE_DURATION / speed`
- Update animation configs with adjusted duration

### `src/components/controls/ControlPanel.tsx` (Modify)
**Purpose:** Add SpeedControl to control panel
**Changes:**
- Import and render `SpeedControl`
- Position next to playback controls

## Type Definitions

### Speed Range

```typescript
// Speed constants
const MIN_SPEED = 0.25;  // Slow motion (4x slower)
const MAX_SPEED = 4;     // Fast forward (4x faster)
const DEFAULT_SPEED = 1; // Normal speed
const SPEED_STEP = 0.25; // Increment step

// Preset speeds
const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4] as const;
type SpeedPreset = typeof SPEED_PRESETS[number];
```

### UI State (if not already present)

```typescript
// src/state/UIContext.tsx

interface UIState {
  isPlaying: boolean;
  speed: number;  // 0.25 - 4
  // ... other fields
}

type UIAction =
  | { type: 'SET_SPEED'; payload: number }
  // ... other actions
```

## Implementation Specifications

### 1. Update UIContext with Speed State

```typescript
// src/state/UIContext.tsx

const initialUIState: UIState = {
  isPlaying: false,
  speed: 1,  // Default to normal speed
  // ... other fields
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_SPEED': {
      // Clamp speed to valid range
      const speed = Math.max(0.25, Math.min(4, action.payload));
      return { ...state, speed };
    }
    
    // ... other cases
    
    default:
      return state;
  }
}
```

### 2. Create SpeedControl Component

```typescript
// src/components/controls/SpeedControl.tsx

import * as Slider from '@radix-ui/react-slider';
import { useUI } from '@/state/hooks/useUI';

const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4] as const;

export function SpeedControl() {
  const { state, dispatch } = useUI();
  const { speed } = state;
  
  const handleSpeedChange = (values: number[]) => {
    dispatch({ type: 'SET_SPEED', payload: values[0] });
  };
  
  const setPresetSpeed = (preset: number) => {
    dispatch({ type: 'SET_SPEED', payload: preset });
  };
  
  // Format speed for display (e.g., "1x", "0.5x", "2x")
  const formatSpeed = (value: number) => {
    return value === 1 ? '1x' : `${value}x`;
  };
  
  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <label htmlFor="speed-slider" className="text-sm font-medium text-gray-300">
        Speed
      </label>
      
      {/* Preset Buttons */}
      <div className="flex gap-1">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setPresetSpeed(preset)}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${speed === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            aria-label={`Set speed to ${formatSpeed(preset)}`}
            aria-pressed={speed === preset}
          >
            {formatSpeed(preset)}
          </button>
        ))}
      </div>
      
      {/* Slider */}
      <Slider.Root
        id="speed-slider"
        className="relative flex items-center select-none touch-none w-32 h-5"
        value={[speed]}
        onValueChange={handleSpeedChange}
        min={0.25}
        max={4}
        step={0.25}
        aria-label="Playback speed"
      >
        <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
          <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
        </Slider.Track>
        
        <Slider.Thumb
          className="block w-4 h-4 bg-white border-2 border-blue-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          aria-label="Speed slider thumb"
        />
      </Slider.Root>
      
      {/* Current Speed Display */}
      <div className="text-sm font-medium text-gray-300 min-w-[3rem] text-right">
        {formatSpeed(speed)}
      </div>
    </div>
  );
}
```

### 3. Update usePlayback to Use Speed

```typescript
// src/state/hooks/usePlayback.ts

export function usePlayback(): UsePlaybackReturn {
  const { state: simState, dispatch: simDispatch } = useSimulator();
  const { state: uiState, dispatch: uiDispatch } = useUI();
  
  const { isPlaying, speed } = uiState;  // Read speed from UI state
  const { stepIndex, history } = simState;
  
  // Calculate interval based on speed
  const BASE_INTERVAL = 1000; // 1 second at 1x speed
  const interval = BASE_INTERVAL / speed;
  
  // ... rest of hook implementation
  
  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    if (!canStepForward) {
      uiDispatch({ type: 'SET_PLAYING', payload: false });
      return;
    }
    
    const timer = setInterval(() => {
      simDispatch({ type: 'STEP_FORWARD' });
    }, interval);  // Use calculated interval
    
    return () => clearInterval(timer);
  }, [isPlaying, interval, canStepForward, simDispatch, uiDispatch]);
  // Note: interval is now in dependencies
  
  // ... rest of hook
}
```

### 4. Update Animation System to Use Speed

```typescript
// src/animations/config.ts

export const BASE_ANIMATION_DURATION = 800; // 800ms at 1x speed

/**
 * Calculate animation duration based on current speed.
 * @param speed - Speed multiplier (0.25 - 4)
 * @returns Duration in milliseconds
 */
export function getAnimationDuration(speed: number): number {
  return BASE_ANIMATION_DURATION / speed;
}

export const animationConfig = {
  baseDuration: BASE_ANIMATION_DURATION,
  easing: 'easeInOut',
  // ... other config
};
```

```typescript
// src/animations/coordinator.ts

import { useUI } from '@/state/hooks/useUI';
import { getAnimationDuration } from './config';

export function useAnimationCoordinator() {
  const { state } = useUI();
  const { speed, reducedMotion } = state;
  
  // Calculate current animation duration
  const animationDuration = reducedMotion ? 0 : getAnimationDuration(speed);
  
  // Use animationDuration for all animations
  const animateTransition = (task: Task, from: Region, to: Region) => {
    return {
      initial: getRegionPosition(from),
      animate: getRegionPosition(to),
      transition: {
        duration: animationDuration / 1000, // Convert to seconds for Framer Motion
        ease: 'easeInOut',
      },
    };
  };
  
  // ... rest of coordinator
}
```

### 5. Update ControlPanel Layout

```typescript
// src/components/controls/ControlPanel.tsx

import { PlaybackControls } from './PlaybackControls';
import { SpeedControl } from './SpeedControl';

export function ControlPanel() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-6">
        <PlaybackControls />
        
        {/* Divider */}
        <div className="w-px h-8 bg-gray-600" />
        
        <SpeedControl />
      </div>
      
      <div className="text-sm text-gray-400">
        {/* Step counter or other info */}
      </div>
    </div>
  );
}
```

## Success Criteria

- [ ] Speed slider renders correctly
- [ ] Can drag slider to adjust speed (0.25x - 4x)
- [ ] Preset buttons set speed correctly
- [ ] Current speed displays accurately
- [ ] Playback interval updates when speed changes
- [ ] Animations speed up/slow down with speed changes
- [ ] Speed persists during pause/play cycles
- [ ] Speed works at all values (0.25x, 0.5x, 1x, 2x, 4x)
- [ ] No visual glitches when changing speed
- [ ] Slider is accessible (keyboard navigation works)
- [ ] ARIA labels present and correct

## Test Specifications

### Test: Speed slider updates state

```typescript
// src/components/controls/__tests__/SpeedControl.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpeedControl } from '../SpeedControl';

test('speed slider updates speed state', async () => {
  const { container } = render(<SpeedControl />);
  
  const slider = screen.getByLabelText(/playback speed/i);
  
  // Simulate slider change (implementation depends on testing library)
  // This is conceptual - actual implementation may vary
  await userEvent.click(slider);
  
  // Verify speed updated
});
```

### Test: Preset buttons set speed

```typescript
test('preset buttons set correct speed', async () => {
  render(<SpeedControl />);
  
  const button2x = screen.getByLabelText(/set speed to 2x/i);
  await userEvent.click(button2x);
  
  // Verify speed is 2
  expect(screen.getByText('2x')).toBeInTheDocument();
});
```

### Test: Speed affects playback interval

```typescript
// src/state/hooks/__tests__/usePlayback.test.ts

test('speed affects playback interval', () => {
  jest.useFakeTimers();
  
  // Mock UIContext with speed = 2
  const { result } = renderHook(() => usePlayback(), {
    wrapper: ({ children }) => (
      <UIProvider initialState={{ speed: 2 }}>
        {children}
      </UIProvider>
    ),
  });
  
  act(() => {
    result.current.play();
  });
  
  // At 2x speed, interval should be 500ms (1000 / 2)
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  // Should have dispatched STEP_FORWARD after 500ms
  
  jest.useRealTimers();
});
```

### Test: Speed affects animation duration

```typescript
// src/animations/__tests__/coordinator.test.ts

import { getAnimationDuration } from '../config';

test('calculates animation duration based on speed', () => {
  expect(getAnimationDuration(1)).toBe(800);     // Normal speed
  expect(getAnimationDuration(2)).toBe(400);     // 2x speed = half duration
  expect(getAnimationDuration(0.5)).toBe(1600);  // 0.5x speed = double duration
  expect(getAnimationDuration(4)).toBe(200);     // 4x speed = quarter duration
});
```

### Test: Speed change during playback

```typescript
test('can change speed while playing', () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(() => usePlayback());
  
  // Start playing at 1x speed
  act(() => {
    result.current.play();
  });
  
  // Fast-forward 1 second (1 step at 1x)
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  
  // Change speed to 2x
  act(() => {
    // Update UIContext speed to 2
    rerender();
  });
  
  // Fast-forward 500ms (should trigger next step at 2x)
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  // Verify correct number of steps
  
  jest.useRealTimers();
});
```

### Test: Keyboard navigation of slider

```typescript
test('can navigate slider with keyboard', async () => {
  render(<SpeedControl />);
  
  const slider = screen.getByRole('slider');
  slider.focus();
  
  await userEvent.keyboard('{ArrowRight}');
  
  // Speed should increase by step (0.25)
});
```

## Integration Points

### With Session 5.1 (Playback Controls)
- `usePlayback` hook now uses `speed` for interval calculation
- Speed changes take effect immediately on playing simulation

### With Phase 4 (Animation System)
- Animation coordinator reads `speed` from UIContext
- All animations adjust duration based on speed
- Formula: `duration = baseDuration / speed`

### With Session 5.3 (Timeline)
- Speed changes during scrubbing should work correctly
- Timeline playback respects speed setting

### With Phase 7 (Accessibility)
- Keyboard navigation of slider
- Screen reader announces speed changes
- Reduced motion disables animations but speed still affects timing

## References

- [Radix UI Slider Documentation](https://www.radix-ui.com/docs/primitives/components/slider)
- [Tech Stack: Radix UI](../../tech-stack.md#radix-ui)
- [Animation Config](../../architecture/animation-config.md)
- [Data Flow: Speed Control](../../architecture/data-flow.md#speed-control)
- [ARIA: slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role)

## Notes

### Speed Calculation
- **Interval:** `1000ms / speed`
  - At 1x: 1000ms between steps
  - At 2x: 500ms between steps
  - At 0.5x: 2000ms between steps
  
- **Animation Duration:** `800ms / speed`
  - At 1x: 800ms animation
  - At 2x: 400ms animation
  - At 0.5x: 1600ms animation

### Radix Slider Configuration
- `min={0.25}`, `max={4}`, `step={0.25}` gives discrete steps
- `value={[speed]}` - array format for single value
- `onValueChange` receives array: `[newValue]`

### Performance Considerations
- Speed changes create a new interval (old one cleaned up)
- Effect runs when speed changes (dependency)
- Animation duration recalculated on each render (use useMemo if needed)

### UX Considerations
- Preset buttons provide quick access to common speeds
- Display shows exact current speed
- Slider provides fine-grained control
- Active preset button highlighted
- Speed persists across pause/play

### Edge Cases
- Speed change while paused: Takes effect on next play
- Speed change while playing: New interval starts immediately
- Very slow speeds (0.25x): Long intervals are okay
- Very fast speeds (4x): Ensure animations don't look janky
