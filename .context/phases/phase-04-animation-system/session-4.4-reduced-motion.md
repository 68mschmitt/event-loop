# Session 4.4: Reduced Motion and Performance Fallbacks

## Overview

This session implements **accessibility and performance features** for the animation system. It detects user preferences for reduced motion (via `prefers-reduced-motion` media query), monitors animation performance, and automatically falls back to instant transitions when needed. This ensures the visualizer is accessible to users with motion sensitivities and performs well even in complex scenarios.

## Prerequisites

- Session 4.1 (Animation Coordinator) complete
- Session 4.2 (TaskNode Component) complete
- Session 4.3 (Path Movement) complete
- Understanding of CSS media queries
- Understanding of `window.matchMedia` API
- Understanding of performance monitoring

## Goals

- [ ] Detect `prefers-reduced-motion` user preference
- [ ] Create `useReducedMotion` hook
- [ ] Disable animations when reduced motion preferred
- [ ] Monitor animation performance (FPS tracking)
- [ ] Automatically disable animations in complex scenarios
- [ ] Provide user toggle for animations (override preference)
- [ ] Show performance indicators in developer mode
- [ ] Ensure smooth degradation (no visual glitches)

## Files to Create

### `src/hooks/useReducedMotion.ts`
**Purpose:** Hook to detect reduced motion preference
**Exports:** `useReducedMotion()` hook

### `src/hooks/useAnimationPerformance.ts`
**Purpose:** Performance monitoring for animations
**Exports:** `useAnimationPerformance()` hook

### `src/animations/config.ts` (update)
**Purpose:** Add performance thresholds
**Exports:** Performance constants

### `src/components/panels/DeveloperPanel.tsx` (update)
**Purpose:** Show animation performance stats
**Exports:** Developer panel with perf metrics

## Type Definitions

### Animation Settings

```typescript
/**
 * Animation configuration settings.
 */
export interface AnimationSettings {
  enabled: boolean;           // Master switch
  respectReducedMotion: boolean;
  performanceMode: PerformanceMode;
  forceDisabled: boolean;     // Emergency kill switch
}

/**
 * Performance mode for animations.
 */
export enum PerformanceMode {
  AUTO = 'auto',         // Automatically adjust based on performance
  FULL = 'full',         // All animations enabled
  REDUCED = 'reduced',   // Simplified animations only
  DISABLED = 'disabled', // No animations
}

/**
 * Performance metrics for animation system.
 */
export interface AnimationPerformanceMetrics {
  fps: number;
  frameTime: number;        // Average frame time in ms
  droppedFrames: number;
  taskCount: number;
  animationCount: number;
  performanceMode: PerformanceMode;
}
```

## Implementation Specifications

### Reduced Motion Hook

**Location:** `src/hooks/useReducedMotion.ts`

```typescript
import { useEffect, useState } from 'react';

/**
 * Hook to detect user's reduced motion preference.
 * 
 * Returns true if user has enabled "prefers-reduced-motion" in OS settings.
 * Updates when preference changes.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialReducedMotionPreference()
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Handler for preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Listen for changes (modern API)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get initial reduced motion preference on mount.
 */
function getInitialReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get animation duration based on reduced motion preference.
 * Returns 0 if reduced motion is preferred, otherwise returns provided duration.
 */
export function getAnimationDuration(
  duration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0 : duration;
}

/**
 * Get transition config for Framer Motion that respects reduced motion.
 */
export function getTransition(
  duration: number,
  prefersReducedMotion: boolean
) {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  return {
    duration: duration / 1000, // Convert to seconds
    ease: 'easeInOut',
  };
}
```

### Performance Monitoring Hook

**Location:** `src/hooks/useAnimationPerformance.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { useSimulator } from '@/state/hooks';
import { PerformanceMode, AnimationPerformanceMetrics } from '@/animations/types';

/**
 * Performance thresholds for automatic mode switching.
 */
const PERFORMANCE_THRESHOLDS = {
  MIN_FPS: 30,              // Below this, disable animations
  TARGET_FPS: 60,           // Target frame rate
  MAX_TASKS: 50,            // Above this, consider reduced mode
  MAX_FRAME_TIME: 33,       // Max ms per frame (30fps)
} as const;

/**
 * Hook to monitor animation performance and automatically adjust quality.
 * 
 * Tracks FPS, frame times, and task count. Automatically disables
 * animations if performance drops below threshold.
 */
export function useAnimationPerformance(): AnimationPerformanceMetrics {
  const { state } = useSimulator();
  const [metrics, setMetrics] = useState<AnimationPerformanceMetrics>({
    fps: 60,
    frameTime: 16,
    droppedFrames: 0,
    taskCount: 0,
    animationCount: 0,
    performanceMode: PerformanceMode.FULL,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  // Count total tasks across all queues
  const taskCount =
    state.callStack.length +
    state.macroQueue.length +
    state.microQueue.length +
    state.rafQueue.length +
    state.webApis.size;

  useEffect(() => {
    const measureFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Store recent frame times (last 60 frames)
      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate metrics
      const averageFrameTime =
        frameTimesRef.current.reduce((a, b) => a + b, 0) /
        frameTimesRef.current.length;

      const fps = 1000 / averageFrameTime;

      const droppedFrames = frameTimesRef.current.filter(
        (t) => t > PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME
      ).length;

      // Determine performance mode
      const performanceMode = determinePerformanceMode(
        fps,
        taskCount,
        averageFrameTime
      );

      setMetrics({
        fps: Math.round(fps),
        frameTime: Math.round(averageFrameTime),
        droppedFrames,
        taskCount,
        animationCount: 0, // Will be populated by animation coordinator
        performanceMode,
      });

      // Continue measuring
      animationFrameRef.current = requestAnimationFrame(measureFrame);
    };

    // Start measuring
    animationFrameRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [taskCount]);

  return metrics;
}

/**
 * Determine appropriate performance mode based on metrics.
 */
function determinePerformanceMode(
  fps: number,
  taskCount: number,
  frameTime: number
): PerformanceMode {
  // Critical: FPS too low
  if (fps < PERFORMANCE_THRESHOLDS.MIN_FPS) {
    return PerformanceMode.DISABLED;
  }

  // Too many tasks: use reduced animations
  if (taskCount > PERFORMANCE_THRESHOLDS.MAX_TASKS) {
    return PerformanceMode.REDUCED;
  }

  // Frame time too high: use reduced animations
  if (frameTime > PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME) {
    return PerformanceMode.REDUCED;
  }

  // All good: full animations
  return PerformanceMode.FULL;
}
```

### Animation Context with Settings

**Location:** `src/animations/AnimationContext.tsx` (update)

```typescript
import { createContext, useContext, ReactNode, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAnimationPerformance } from '@/hooks/useAnimationPerformance';
import { AnimationSettings, PerformanceMode } from './types';

interface AnimationContextValue {
  settings: AnimationSettings;
  metrics: AnimationPerformanceMetrics;
  shouldAnimate: boolean;
  updateSettings: (settings: Partial<AnimationSettings>) => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const metrics = useAnimationPerformance();

  const [settings, setSettings] = useState<AnimationSettings>({
    enabled: true,
    respectReducedMotion: true,
    performanceMode: PerformanceMode.AUTO,
    forceDisabled: false,
  });

  // Determine if animations should run
  const shouldAnimate = calculateShouldAnimate(
    settings,
    prefersReducedMotion,
    metrics.performanceMode
  );

  const updateSettings = (partial: Partial<AnimationSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AnimationContext.Provider
      value={{
        settings,
        metrics,
        shouldAnimate,
        updateSettings,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}

/**
 * Calculate whether animations should run based on all factors.
 */
function calculateShouldAnimate(
  settings: AnimationSettings,
  prefersReducedMotion: boolean,
  autoPerformanceMode: PerformanceMode
): boolean {
  // Force disabled always wins
  if (settings.forceDisabled) {
    return false;
  }

  // Master switch
  if (!settings.enabled) {
    return false;
  }

  // Respect user's reduced motion preference
  if (settings.respectReducedMotion && prefersReducedMotion) {
    return false;
  }

  // Check performance mode
  if (settings.performanceMode === PerformanceMode.AUTO) {
    return autoPerformanceMode !== PerformanceMode.DISABLED;
  }

  return settings.performanceMode !== PerformanceMode.DISABLED;
}
```

### Updated TaskNode with Reduced Motion

**Location:** `src/components/visualization/TaskNode.tsx` (update)

```typescript
import { useAnimation } from '@/animations/AnimationContext';
import { getTransition } from '@/hooks/useReducedMotion';

export function TaskNode({ task, region, onSelect }: TaskNodeProps) {
  const { shouldAnimate } = useAnimation();
  const colors = getTaskColors(task.type);
  const variant = mapTaskStateToVariant(task.state);

  // Get appropriate transition
  const transition = shouldAnimate
    ? taskTransition
    : { duration: 0 }; // Instant transition

  return (
    <motion.div
      layoutId={task.id}
      layout
      transition={transition}
      variants={taskVariants}
      initial="created"
      animate={variant}
      // ... rest of props
    >
      {/* Task content */}
    </motion.div>
  );
}
```

### Performance Indicator Component

**Location:** `src/components/debug/PerformanceIndicator.tsx`

```typescript
import { useAnimation } from '@/animations/AnimationContext';
import { PerformanceMode } from '@/animations/types';

/**
 * Visual indicator of animation performance.
 * Shows FPS, frame time, and current performance mode.
 */
export function PerformanceIndicator() {
  const { metrics } = useAnimation();

  const statusColor = getStatusColor(metrics.fps);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm font-mono">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="font-semibold">Performance</span>
      </div>

      <div className="space-y-1">
        <div>
          FPS: <span className="font-bold">{metrics.fps}</span>
        </div>
        <div>
          Frame: <span className="font-bold">{metrics.frameTime}ms</span>
        </div>
        <div>
          Dropped: <span className="font-bold">{metrics.droppedFrames}</span>
        </div>
        <div>
          Tasks: <span className="font-bold">{metrics.taskCount}</span>
        </div>
        <div>
          Mode: <span className="font-bold">{metrics.performanceMode}</span>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(fps: number): string {
  if (fps >= 55) return 'bg-green-500';
  if (fps >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
}
```

### Animation Settings Panel

**Location:** `src/components/panels/AnimationSettings.tsx`

```typescript
import { useAnimation } from '@/animations/AnimationContext';
import { PerformanceMode } from '@/animations/types';

/**
 * Panel for controlling animation settings.
 */
export function AnimationSettingsPanel() {
  const { settings, updateSettings, shouldAnimate, metrics } = useAnimation();

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Animation Settings</h3>

      {/* Master toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => updateSettings({ enabled: e.target.checked })}
        />
        <span>Enable Animations</span>
      </label>

      {/* Respect reduced motion */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.respectReducedMotion}
          onChange={(e) =>
            updateSettings({ respectReducedMotion: e.target.checked })
          }
        />
        <span>Respect Reduced Motion Preference</span>
      </label>

      {/* Performance mode */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Performance Mode
        </label>
        <select
          value={settings.performanceMode}
          onChange={(e) =>
            updateSettings({ performanceMode: e.target.value as PerformanceMode })
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value={PerformanceMode.AUTO}>Auto</option>
          <option value={PerformanceMode.FULL}>Full</option>
          <option value={PerformanceMode.REDUCED}>Reduced</option>
          <option value={PerformanceMode.DISABLED}>Disabled</option>
        </select>
      </div>

      {/* Status */}
      <div className="p-3 bg-gray-100 rounded">
        <div className="text-sm">
          <div>
            Current Status: <strong>{shouldAnimate ? 'Animating' : 'Disabled'}</strong>
          </div>
          <div>
            FPS: <strong>{metrics.fps}</strong>
          </div>
          <div>
            Mode: <strong>{metrics.performanceMode}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Success Criteria

- [ ] `useReducedMotion` detects prefers-reduced-motion correctly
- [ ] Animations disabled when reduced motion preferred
- [ ] Performance monitoring tracks FPS accurately
- [ ] Auto mode switches to reduced/disabled when performance drops
- [ ] User can manually override animation settings
- [ ] No visual glitches when animations disabled
- [ ] Instant transitions work smoothly (duration: 0)
- [ ] Performance indicator shows accurate metrics
- [ ] Settings persist across page reloads (optional)

## Test Specifications

### Test: useReducedMotion detects preference

**Given:** Browser with prefers-reduced-motion enabled
**When:** Hook is called
**Then:** Returns true

```typescript
test('useReducedMotion detects reduced motion preference', () => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  const { result } = renderHook(() => useReducedMotion());

  expect(result.current).toBe(true);
});
```

### Test: getAnimationDuration returns 0 for reduced motion

**Given:** Reduced motion is preferred
**When:** getAnimationDuration is called with duration 500ms
**Then:** Returns 0

```typescript
test('getAnimationDuration returns 0 when reduced motion preferred', () => {
  const duration = getAnimationDuration(500, true);
  expect(duration).toBe(0);
});

test('getAnimationDuration returns duration when not reduced', () => {
  const duration = getAnimationDuration(500, false);
  expect(duration).toBe(500);
});
```

### Test: Performance mode switches automatically

**Given:** Animation performance drops below threshold
**When:** determinePerformanceMode is called
**Then:** Returns DISABLED or REDUCED mode

```typescript
test('determinePerformanceMode returns DISABLED for low FPS', () => {
  const mode = determinePerformanceMode(25, 20, 40);
  expect(mode).toBe(PerformanceMode.DISABLED);
});

test('determinePerformanceMode returns REDUCED for many tasks', () => {
  const mode = determinePerformanceMode(60, 100, 16);
  expect(mode).toBe(PerformanceMode.REDUCED);
});

test('determinePerformanceMode returns FULL for good performance', () => {
  const mode = determinePerformanceMode(60, 20, 16);
  expect(mode).toBe(PerformanceMode.FULL);
});
```

### Test: shouldAnimate respects all factors

**Given:** Various setting combinations
**When:** calculateShouldAnimate is called
**Then:** Returns correct boolean

```typescript
test('shouldAnimate returns false when force disabled', () => {
  const settings = {
    enabled: true,
    respectReducedMotion: true,
    performanceMode: PerformanceMode.FULL,
    forceDisabled: true,
  };

  const result = calculateShouldAnimate(settings, false, PerformanceMode.FULL);
  expect(result).toBe(false);
});

test('shouldAnimate respects reduced motion preference', () => {
  const settings = {
    enabled: true,
    respectReducedMotion: true,
    performanceMode: PerformanceMode.FULL,
    forceDisabled: false,
  };

  const result = calculateShouldAnimate(settings, true, PerformanceMode.FULL);
  expect(result).toBe(false);
});
```

## Integration Points

- **Session 4.1**: Coordinator checks shouldAnimate before queuing
- **Session 4.2**: TaskNode uses instant transitions when disabled
- **Session 4.3**: Path animations skipped when disabled
- **Phase 5 Controls**: Settings panel in controls area
- **Phase 8 Polish**: Performance indicator in developer mode

## Accessibility Considerations

### WCAG Guidelines

- **WCAG 2.1 Success Criterion 2.3.3**: Animation from Interactions (Level AAA)
- **WCAG 2.1 Success Criterion 2.2.2**: Pause, Stop, Hide (Level A)

### Best Practices

1. **Respect user preferences**: Always honor `prefers-reduced-motion`
2. **Provide manual controls**: Let users override if needed
3. **No essential info in animations**: Content should be understandable without motion
4. **Smooth degradation**: Instant transitions should not break UI

## Performance Optimization Tips

### Minimize Layout Thrashing

```typescript
// Bad: Multiple layout reads/writes
element.style.height = '100px';
const height = element.offsetHeight; // Forces layout
element.style.width = '200px';

// Good: Batch reads, then batch writes
const height = element.offsetHeight;
const width = element.offsetWidth;
element.style.height = '100px';
element.style.width = '200px';
```

### Use GPU-Accelerated Properties

```typescript
// GPU-accelerated (fast)
transform: 'translateX(100px)',
opacity: 0.5,

// Not GPU-accelerated (slow)
left: '100px',
width: '200px',
```

### Debounce Performance Checks

```typescript
// Check performance every 500ms instead of every frame
const debouncedCheck = useMemo(
  () => debounce(checkPerformance, 500),
  []
);
```

## References

- [prefers-reduced-motion Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

## Notes

- **Always test with reduced motion enabled** in OS settings
- Use browser DevTools Performance panel to profile animations
- Monitor **frame time**, not just FPS (frame time = 1000 / fps)
- Consider **battery usage** on mobile devices
- Provide **clear visual feedback** when animations are disabled
- Performance metrics should be **lightweight** (minimal overhead)
