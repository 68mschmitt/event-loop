# Phase 5 Implementation Prompt - Controls & Timeline

Implement comprehensive playback controls and timeline features that give users precise control over the event loop visualization.

## Overview

Phase 5 adds **interactive playback controls** (play/pause/step), **speed adjustment**, and a **timeline scrubber** that allows users to navigate through simulation history. These controls transform the visualizer from a passive animation into an interactive learning tool.

## Prerequisites

- ✅ Phase 4 complete (Animation system with Framer Motion)
- ✅ State management with history tracking (Phase 2)
- ✅ UI components and layout (Phase 3)
- ✅ Understanding of React hooks, animation timing, and accessibility

## Session Breakdown (10-14 hours total)

### **Session 5.1: Playback Controls (3-4 hours)**
Build the primary control interface:
- Create `PlaybackControls` component with play/pause/step buttons
- Implement keyboard shortcuts (Space = play/pause, ArrowLeft/Right = step)
- Add visual feedback for control states (playing, paused, at bounds)
- Build `usePlayback` hook to manage playback state
- Integrate with SimulatorContext to trigger step forward/backward
- Add auto-play mode with configurable delay between steps
- Display current step number and total steps

**Key files:**
- `src/components/controls/PlaybackControls.tsx` - Main control UI
- `src/hooks/usePlayback.ts` - Playback state management
- `src/components/controls/ControlButton.tsx` - Reusable button component

**Key interactions:**
```typescript
interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  currentStep: number;
  totalSteps: number;
}
```

### **Session 5.2: Speed Control (2-3 hours)**
Add granular speed adjustment:
- Create `SpeedControl` component with preset buttons (0.25x, 0.5x, 1x, 2x, 4x)
- Add custom speed slider for fine-tuning
- Integrate with AnimationContext to update animation speeds
- Show current speed multiplier with visual indicator
- Implement speed keyboard shortcuts (1-5 keys for presets)
- Add "reset to 1x" button
- Persist speed preference to localStorage

**Key files:**
- `src/components/controls/SpeedControl.tsx` - Speed UI
- `src/hooks/useSpeedControl.ts` - Speed state management
- Update `src/animations/AnimationContext.tsx` - Connect speed to animations

**Speed presets:**
```typescript
const SPEED_PRESETS = [
  { label: '0.25×', value: 0.25 },
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
] as const;
```

### **Session 5.3: Timeline Scrubber (5-7 hours)**
Build interactive timeline navigation:
- Create `Timeline` component with horizontal scrubber
- Display tick markers for each step in history
- Show visual indicators for key events (task enqueued, completed, renders)
- Implement draggable scrubber handle
- Add click-to-jump navigation
- Show preview tooltip on hover (step number, event description)
- Highlight current step position
- Add minimap view for long simulations (100+ steps)
- Implement smooth scroll-to-center for active step
- Add touch/mobile support for scrubbing

**Key files:**
- `src/components/timeline/Timeline.tsx` - Timeline container
- `src/components/timeline/TimelineScrubber.tsx` - Draggable handle
- `src/components/timeline/TimelineMarkers.tsx` - Event indicators
- `src/components/timeline/TimelineTooltip.tsx` - Hover preview
- `src/hooks/useTimelineScrubber.ts` - Drag/click logic
- `src/utils/timelineHelpers.ts` - Position/scale calculations

**Timeline structure:**
```typescript
interface TimelineEvent {
  stepIndex: number;
  type: 'task-enqueue' | 'task-complete' | 'render' | 'tick';
  label: string;
  color: string;
}

interface TimelineState {
  currentStep: number;
  totalSteps: number;
  events: TimelineEvent[];
  viewportRange: { start: number; end: number }; // for minimap
}
```

## Key Concepts

**Playback Coordination:**
```typescript
// Play mode: auto-advance with animation timing
const play = () => {
  setIsPlaying(true);
  const interval = setInterval(() => {
    if (canStepForward) {
      stepForward();
    } else {
      pause();
    }
  }, animationDuration + delay);
};
```

**Timeline Scrubbing:**
```typescript
// Convert mouse X position to step index
const getStepFromPosition = (clientX: number) => {
  const rect = timelineRef.current.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  const percentage = relativeX / rect.width;
  return Math.floor(percentage * totalSteps);
};
```

**Keyboard Shortcuts:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
      stepBackward();
    } else if (e.code === 'ArrowRight') {
      stepForward();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Success Criteria

Phase 5 is complete when:
- ✅ Play/pause/step controls work correctly
- ✅ Keyboard shortcuts functional (Space, Arrows, 1-5)
- ✅ Speed control updates animation timing in real-time
- ✅ Timeline scrubber allows jumping to any step
- ✅ Timeline displays visual markers for key events
- ✅ Hover tooltips show step details
- ✅ Touch/mobile scrubbing works on tablets/phones
- ✅ Controls disabled appropriately at history bounds
- ✅ Speed preference persists across sessions
- ✅ All controls have proper ARIA labels and keyboard navigation
- ✅ Smooth animations when scrubbing through timeline
- ✅ TypeScript compiles without errors
- ✅ All existing tests still pass

## Common Pitfalls to Avoid

❌ **Rapid clicking/scrubbing causing animation conflicts**
✅ **Debounce timeline changes** and cancel in-flight animations

❌ **Timeline scrolling interfering with page scroll**
✅ **Use pointer events** and preventDefault appropriately

❌ **Poor performance with 100+ timeline markers**
✅ **Virtualize timeline** or use minimap for long simulations

❌ **Keyboard shortcuts conflicting with browser defaults**
✅ **Check for modifier keys** and only preventDefault when needed

❌ **Mobile timeline too small to scrub accurately**
✅ **Increase hit targets** to at least 44×44px on mobile

## Implementation Tips

### Playback Hook Pattern
```typescript
export function usePlayback() {
  const { stepForward, stepBackward, canStepForward, canStepBackward } = useSimulator();
  const { settings } = useAnimationSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const play = useCallback(() => {
    if (!canStepForward) return;
    setIsPlaying(true);
  }, [canStepForward]);
  
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const delay = calculateDelay(settings.speed);
    const timeout = setTimeout(() => {
      if (canStepForward) {
        stepForward();
      } else {
        pause();
      }
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [isPlaying, canStepForward, stepForward, pause, settings.speed]);
  
  return { isPlaying, play, pause, /* ... */ };
}
```

### Timeline Drag Handler
```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  const step = getStepFromPosition(e.clientX);
  jumpToStep(step);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  const step = getStepFromPosition(e.clientX);
  jumpToStep(step);
};

const handleMouseUp = () => {
  setIsDragging(false);
};

useEffect(() => {
  if (isDragging) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging]);
```

### Speed Persistence
```typescript
// Load saved speed on mount
useEffect(() => {
  const savedSpeed = localStorage.getItem('visualizer-speed');
  if (savedSpeed) {
    setSpeed(parseFloat(savedSpeed));
  }
}, []);

// Save speed changes
useEffect(() => {
  localStorage.setItem('visualizer-speed', speed.toString());
}, [speed]);
```

## Integration with Existing Code

### Connect to SimulatorContext
```typescript
// In App.tsx or main layout
<AnimationProvider>
  <SimulatorProvider>
    <PlaybackControls />
    <Timeline />
    <SpeedControl />
    <Canvas />
  </SimulatorProvider>
</AnimationProvider>
```

### Coordinate Animations
The controls should respect animation completion:
- Don't advance to next step until current animations finish
- Pause animations when scrubbing quickly
- Resume animations when scrubbing stops

## Polishing Phase

### After Implementation - Use Context7 MCP for Framework Best Practices

Once you've completed all three sessions and have working controls, **use the Context7 MCP tool** to verify your implementation follows React and Framer Motion best practices:

1. **Get React documentation:**
   ```typescript
   // Use context7_resolve-library-id to find React
   context7_resolve-library-id({ libraryName: "react" })
   
   // Then get docs on hooks and performance
   context7_get-library-docs({ 
     context7CompatibleLibraryID: "/facebook/react",
     topic: "hooks performance",
     mode: "code"
   })
   ```

2. **Get Framer Motion documentation:**
   ```typescript
   // Resolve Framer Motion library
   context7_resolve-library-id({ libraryName: "framer-motion" })
   
   // Get animation best practices
   context7_get-library-docs({
     context7CompatibleLibraryID: "/framer/motion",
     topic: "animation performance gesture drag",
     mode: "code"
   })
   ```

3. **Review your code against docs:**
   - Check if useCallback/useMemo are used correctly
   - Verify animation performance optimizations
   - Ensure drag/gesture handlers follow best practices
   - Confirm accessibility patterns match React recommendations

4. **Common things to verify:**
   - Are timeline drag handlers optimized?
   - Is the playback interval cleaned up properly?
   - Are animation state updates batched correctly?
   - Is the speed slider using proper Framer Motion drag constraints?

This verification step ensures your controls are production-ready and follow framework conventions.

## Testing Checklist

Manual testing to perform:
- [ ] Click play → simulation auto-advances
- [ ] Click pause → simulation stops
- [ ] Press Space → toggles play/pause
- [ ] Press Arrow keys → steps forward/backward
- [ ] Press 1-5 keys → changes speed
- [ ] Drag timeline scrubber → jumps to steps smoothly
- [ ] Click on timeline → jumps to that step
- [ ] Hover timeline → shows tooltip
- [ ] Test on mobile/tablet → touch dragging works
- [ ] Test at simulation start → backward disabled
- [ ] Test at simulation end → forward disabled
- [ ] Change speed during playback → timing adjusts immediately
- [ ] Refresh page → speed preference restored
- [ ] Tab through controls → keyboard navigation works
- [ ] Screen reader → all controls announced properly

## Next Steps After Phase 5

Once controls are complete:
1. **User test** the playback experience with real scenarios
2. **Profile performance** of timeline with 200+ steps
3. **Add analytics** (optional) to track which speeds users prefer
4. **Proceed to Phase 6** (Scenario System) to add preset examples

## Resources

- **Framer Motion Gestures:** For drag and hover interactions on timeline
- **React useCallback:** Optimize event handlers to prevent re-renders
- **Intersection Observer:** For virtualizing long timelines
- **Web Animations API:** For smooth scrubber animations

---

**Estimated Total Time:** 10-14 hours
**Complexity:** Medium-High (drag interactions, timing coordination)
**Dependencies:** Phase 2 (history), Phase 3 (UI), Phase 4 (animations)
