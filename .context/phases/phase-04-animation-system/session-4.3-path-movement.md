# Session 4.3: Path-Based Movement Between Regions

## Overview

This session implements **path-based animations** for tasks moving between regions. Instead of simple linear transitions, tasks follow smooth curved paths (bezier curves) that make the visualization more engaging and easier to follow. The system calculates SVG paths between region centers and uses Framer Motion's `motion.path` to animate along them.

## Prerequisites

- Session 4.1 (Animation Coordinator) complete
- Session 4.2 (TaskNode Component) complete
- Understanding of SVG paths and bezier curves
- Understanding of coordinate systems and transforms
- Basic geometry knowledge (calculating midpoints, control points)

## Goals

- [ ] Calculate region center coordinates
- [ ] Generate SVG paths between regions with bezier curves
- [ ] Create custom motion component for path-based animation
- [ ] Integrate path animations with TaskNode
- [ ] Handle different path types (straight, curved, arc)
- [ ] Optimize path calculation (memoization)
- [ ] Add visual path indicators (optional debug mode)
- [ ] Support bidirectional movements

## Files to Create

### `src/animations/paths.ts`
**Purpose:** Path calculation utilities
**Exports:** Path generation functions, region coordinate mapping

### `src/animations/components/PathMotion.tsx`
**Purpose:** Custom motion component for path animations
**Exports:** `PathMotion` component

### `src/hooks/useRegionCoordinates.ts`
**Purpose:** Hook to get region element coordinates
**Exports:** `useRegionCoordinates()` hook

### `src/animations/PathDebugger.tsx` (optional)
**Purpose:** Visual debugging tool for paths
**Exports:** `PathDebugger` component

## Type Definitions

### Path Types

```typescript
/**
 * 2D point coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounding box of a region.
 */
export interface RegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Generated path between two regions.
 */
export interface AnimationPath {
  id: string;
  from: Region;
  to: Region;
  d: string;              // SVG path data string
  length: number;         // Path length in pixels
  controlPoints: Point[]; // Bezier control points
}

/**
 * Path style (affects curve shape).
 */
export enum PathStyle {
  STRAIGHT = 'straight',    // Direct line
  CURVED = 'curved',        // Smooth bezier curve
  ARC = 'arc',              // Circular arc
}
```

## Implementation Specifications

### Region Coordinate Mapping

**Location:** `src/hooks/useRegionCoordinates.ts`

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { Region } from '@/animations/types';
import { RegionBounds } from '@/animations/paths';

/**
 * Hook to get bounding boxes for all visualization regions.
 * 
 * Uses refs to access DOM elements and getBoundingClientRect().
 * Updates when window resizes.
 */
export function useRegionCoordinates() {
  const [bounds, setBounds] = useState<Record<Region, RegionBounds | null>>({
    'webapis': null,
    'macro-queue': null,
    'micro-queue': null,
    'raf-queue': null,
    'call-stack': null,
    'render-pipeline': null,
  });

  const updateBounds = useCallback(() => {
    const newBounds: Record<Region, RegionBounds | null> = {
      'webapis': getRegionBounds('webapis'),
      'macro-queue': getRegionBounds('macro-queue'),
      'micro-queue': getRegionBounds('micro-queue'),
      'raf-queue': getRegionBounds('raf-queue'),
      'call-stack': getRegionBounds('call-stack'),
      'render-pipeline': getRegionBounds('render-pipeline'),
    };

    setBounds(newBounds);
  }, []);

  useEffect(() => {
    // Initial calculation
    updateBounds();

    // Recalculate on resize
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  return { bounds, updateBounds };
}

/**
 * Get bounding box for a region by data attribute.
 */
function getRegionBounds(region: Region): RegionBounds | null {
  const element = document.querySelector(`[data-region="${region}"]`);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}
```

### Path Generation

**Location:** `src/animations/paths.ts`

```typescript
import { Region } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface RegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface AnimationPath {
  id: string;
  from: Region;
  to: Region;
  d: string;
  length: number;
  controlPoints: Point[];
}

/**
 * Generate SVG path between two regions.
 * 
 * Uses quadratic bezier curve for smooth transition.
 * Control point is offset perpendicular to the line for natural curves.
 */
export function generatePath(
  from: Region,
  to: Region,
  fromBounds: RegionBounds,
  toBounds: RegionBounds
): AnimationPath {
  const start: Point = { x: fromBounds.centerX, y: fromBounds.centerY };
  const end: Point = { x: toBounds.centerX, y: toBounds.centerY };

  // Calculate control point for bezier curve
  const controlPoint = calculateControlPoint(start, end);

  // Generate SVG path data
  const d = `M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y} ${end.x} ${end.y}`;

  // Calculate approximate path length
  const length = approximatePathLength(start, controlPoint, end);

  return {
    id: `${from}-to-${to}`,
    from,
    to,
    d,
    length,
    controlPoints: [start, controlPoint, end],
  };
}

/**
 * Calculate control point for quadratic bezier curve.
 * 
 * Places control point perpendicular to the line between start and end,
 * offset by a distance proportional to the distance between points.
 */
function calculateControlPoint(start: Point, end: Point): Point {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Vector from start to end
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Distance between points
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (rotated 90 degrees)
  const perpX = -dy;
  const perpY = dx;

  // Normalize perpendicular vector
  const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
  const normPerpX = perpX / perpLength;
  const normPerpY = perpY / perpLength;

  // Offset distance (proportional to distance between points)
  const offset = distance * 0.3; // 30% of distance

  // Control point offset from midpoint
  const controlX = midX + normPerpX * offset;
  const controlY = midY + normPerpY * offset;

  return { x: controlX, y: controlY };
}

/**
 * Approximate length of quadratic bezier curve.
 * 
 * Uses simple linear approximation (good enough for our purposes).
 */
function approximatePathLength(
  start: Point,
  control: Point,
  end: Point
): number {
  // Distance from start to control
  const d1 = Math.sqrt(
    Math.pow(control.x - start.x, 2) + Math.pow(control.y - start.y, 2)
  );

  // Distance from control to end
  const d2 = Math.sqrt(
    Math.pow(end.x - control.x, 2) + Math.pow(end.y - control.y, 2)
  );

  return d1 + d2;
}

/**
 * Generate paths between commonly connected regions.
 * 
 * Memoize results for performance.
 */
export class PathCache {
  private cache = new Map<string, AnimationPath>();

  getPath(
    from: Region,
    to: Region,
    bounds: Record<Region, RegionBounds | null>
  ): AnimationPath | null {
    const key = `${from}-${to}`;
    
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Get bounds
    const fromBounds = bounds[from];
    const toBounds = bounds[to];

    if (!fromBounds || !toBounds) {
      return null;
    }

    // Generate path
    const path = generatePath(from, to, fromBounds, toBounds);

    // Cache for next time
    this.cache.set(key, path);

    return path;
  }

  clear() {
    this.cache.clear();
  }
}
```

### Path Motion Component

**Location:** `src/animations/components/PathMotion.tsx`

```typescript
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, ReactNode } from 'react';
import { AnimationPath } from '../paths';

export interface PathMotionProps {
  path: AnimationPath;
  duration: number;
  children: ReactNode;
  onComplete?: () => void;
}

/**
 * Component that animates children along an SVG path.
 * 
 * Uses Framer Motion's useMotionValue and useTransform to calculate
 * position along the path over time.
 */
export function PathMotion({ 
  path, 
  duration, 
  children,
  onComplete 
}: PathMotionProps) {
  // Progress along path (0 to 1)
  const progress = useMotionValue(0);

  // Transform progress to x/y coordinates
  const x = useTransform(progress, [0, 1], [
    path.controlPoints[0].x,
    path.controlPoints[2].x,
  ]);
  
  const y = useTransform(progress, [0, 1], [
    path.controlPoints[0].y,
    path.controlPoints[2].y,
  ]);

  useEffect(() => {
    // Animate progress from 0 to 1
    const controls = animate(progress, 1, {
      duration: duration / 1000, // Convert ms to seconds
      ease: 'easeInOut',
      onComplete,
    });

    return () => controls.stop();
  }, [progress, duration, onComplete]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        x,
        y,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Integration with TaskNode

**Location:** `src/components/visualization/TaskNode.tsx` (update)

Add support for path-based movement:

```typescript
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { AnimationPath } from '@/animations/paths';

export interface TaskNodeProps {
  task: Task;
  region: Region;
  animationPath?: AnimationPath | null;
  onSelect?: (taskId: string) => void;
}

export function TaskNode({ 
  task, 
  region, 
  animationPath,
  onSelect 
}: TaskNodeProps) {
  const controls = useAnimation();
  const colors = getTaskColors(task.type);
  const variant = mapTaskStateToVariant(task.state);

  // If path is provided, animate along it
  useEffect(() => {
    if (animationPath) {
      animateAlongPath(controls, animationPath);
    }
  }, [animationPath, controls]);

  return (
    <motion.div
      layoutId={task.id}
      layout={!animationPath} // Disable layout animation when using path
      animate={controls}
      variants={taskVariants}
      initial="created"
      // ... rest of props
    >
      {/* Task content */}
    </motion.div>
  );
}

/**
 * Animate element along a path.
 */
async function animateAlongPath(
  controls: AnimationControls,
  path: AnimationPath
) {
  // Get path points
  const [start, control, end] = path.controlPoints;

  // Animate along bezier curve
  await controls.start({
    x: [start.x, control.x, end.x],
    y: [start.y, control.y, end.y],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  });
}
```

### Path Debugger (Optional)

**Location:** `src/animations/PathDebugger.tsx`

```typescript
import { AnimationPath } from './paths';

export interface PathDebuggerProps {
  paths: AnimationPath[];
  visible: boolean;
}

/**
 * Visual debugger for animation paths.
 * 
 * Renders SVG overlay showing calculated paths and control points.
 */
export function PathDebugger({ paths, visible }: PathDebuggerProps) {
  if (!visible) return null;

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    >
      {paths.map(path => (
        <g key={path.id}>
          {/* Path line */}
          <path
            d={path.d}
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Control points */}
          {path.controlPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={i === 1 ? 'red' : 'blue'}
            />
          ))}

          {/* Path label */}
          <text
            x={path.controlPoints[1].x}
            y={path.controlPoints[1].y - 10}
            fill="blue"
            fontSize="12"
          >
            {path.from} → {path.to}
          </text>
        </g>
      ))}
    </svg>
  );
}
```

## Success Criteria

- [ ] Paths generated correctly between all regions
- [ ] Paths use smooth bezier curves (not straight lines)
- [ ] Tasks animate smoothly along paths
- [ ] Path calculation memoized for performance
- [ ] Region coordinates update on window resize
- [ ] No visual jumps or discontinuities
- [ ] Path animations synchronized with state changes
- [ ] Debug mode shows paths visually (optional)

## Test Specifications

### Test: Path generation creates valid SVG path

**Given:** Two region bounds
**When:** generatePath is called
**Then:** Returns valid SVG path string

```typescript
import { generatePath } from '@/animations/paths';

test('generatePath creates valid SVG path', () => {
  const fromBounds = {
    x: 0, y: 0, width: 100, height: 100,
    centerX: 50, centerY: 50,
  };

  const toBounds = {
    x: 200, y: 200, width: 100, height: 100,
    centerX: 250, centerY: 250,
  };

  const path = generatePath('webapis', 'macro-queue', fromBounds, toBounds);

  expect(path.d).toMatch(/^M \d+ \d+ Q \d+ \d+ \d+ \d+$/);
  expect(path.from).toBe('webapis');
  expect(path.to).toBe('macro-queue');
  expect(path.controlPoints).toHaveLength(3);
});
```

### Test: Control point creates curved path

**Given:** Start and end points
**When:** Control point calculated
**Then:** Control point is offset from midpoint

```typescript
test('calculateControlPoint offsets from midpoint', () => {
  const start = { x: 0, y: 0 };
  const end = { x: 100, y: 100 };

  const control = calculateControlPoint(start, end);

  // Control should not be exactly at midpoint
  expect(control.x).not.toBe(50);
  expect(control.y).not.toBe(50);

  // Control should create a curve
  const midpoint = { x: 50, y: 50 };
  const distanceFromMid = Math.sqrt(
    Math.pow(control.x - midpoint.x, 2) +
    Math.pow(control.y - midpoint.y, 2)
  );
  
  expect(distanceFromMid).toBeGreaterThan(0);
});
```

### Test: PathCache memoizes results

**Given:** PathCache instance
**When:** Same path requested twice
**Then:** Returns cached result without recalculation

```typescript
test('PathCache memoizes path calculations', () => {
  const cache = new PathCache();
  const bounds = {
    'webapis': { centerX: 50, centerY: 50, /* ... */ },
    'macro-queue': { centerX: 250, centerY: 250, /* ... */ },
  };

  const path1 = cache.getPath('webapis', 'macro-queue', bounds);
  const path2 = cache.getPath('webapis', 'macro-queue', bounds);

  // Should return same object reference (cached)
  expect(path1).toBe(path2);
});
```

### Test: Region coordinates update on resize

**Given:** useRegionCoordinates hook
**When:** Window resizes
**Then:** Bounds recalculated

```typescript
import { renderHook, act } from '@testing-library/react';
import { useRegionCoordinates } from '@/hooks/useRegionCoordinates';

test('useRegionCoordinates updates on window resize', () => {
  const { result } = renderHook(() => useRegionCoordinates());

  const initialBounds = result.current.bounds;

  // Simulate window resize
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });

  // Bounds should be recalculated
  expect(result.current.bounds).not.toBe(initialBounds);
});
```

## Integration Points

- **Session 4.1**: Coordinator detects movements and triggers path animations
- **Session 4.2**: TaskNode uses paths for movement animations
- **Session 4.4**: Reduced motion can skip path animations
- **Phase 3 UI**: Regions need data-region attributes for coordinate lookup
- **Phase 8 Debug**: PathDebugger visualizes paths in developer mode

## Advanced Techniques

### Adaptive Control Points

Adjust curve intensity based on distance:

```typescript
const offset = distance * Math.min(0.3, 100 / distance);
```

### Path Smoothing

Use cubic bezier for smoother curves:

```typescript
const d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`;
```

### Path Following with Rotation

Rotate element to face direction of movement:

```typescript
const angle = Math.atan2(dy, dx) * (180 / Math.PI);
<motion.div style={{ rotate: angle }} />
```

## References

- [SVG Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [Bezier Curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)
- [Framer Motion Motion Values](https://www.framer.com/motion/motionvalue/)
- [Element.getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

## Notes

- Paths are **calculated dynamically** based on actual DOM positions
- Use **data-region attributes** on region elements for lookup
- **Memoize paths** to avoid recalculating on every render
- Control points create **natural curves** that guide the eye
- Path animations are **optional** - layout animations work as fallback
- Debug mode is **essential** for tuning path aesthetics
