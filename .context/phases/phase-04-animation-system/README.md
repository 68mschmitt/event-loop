# Phase 4: Animation System

## Overview

Phase 4 implements the **animation layer** that brings the visualization to life. Using Framer Motion, this phase creates smooth, choreographed transitions as tasks move through the event loop. The animation system coordinates with the state layer to detect changes and trigger appropriate visual effects.

## Goals

By the end of Phase 4, you will have:
- ✅ Animation coordinator that detects state changes and queues animations
- ✅ TaskNode component with state-based visual transitions
- ✅ Path calculation for smooth movement between regions
- ✅ Reduced motion support and performance fallbacks
- ✅ Sequential animation execution with speed multiplier
- ✅ Synchronized animations with state updates

## Why This Phase Now?

With the core simulator (Phase 1), state management (Phase 2), and UI scaffolding (Phase 3) complete, we can now add the visual polish that makes the event loop behavior intuitive. Animations transform a static visualization into an engaging learning tool.

Without animations:
- Hard to follow task movements
- State changes are jarring
- Unclear cause-and-effect relationships

With animations:
- Visual continuity shows task flow
- Smooth transitions are easier to follow
- Choreography highlights event loop rules

## Sessions

### Session 4.1: Animation Coordinator and Queuing System
**Duration:** 3-4 hours
**Complexity:** High

Build the animation coordinator that detects state changes, queues animations, and executes them sequentially with proper timing.

[See session-4.1-coordinator.md](./session-4.1-coordinator.md)

### Session 4.2: TaskNode Component with State-Based Animations
**Duration:** 3-4 hours
**Complexity:** Medium-High

Create the animated TaskNode component that uses Framer Motion variants to transition between states (created, queued, running, completed).

[See session-4.2-task-node.md](./session-4.2-task-node.md)

### Session 4.3: Path-Based Movement Between Regions
**Duration:** 4-5 hours
**Complexity:** High

Implement path calculation for tasks moving between regions, using SVG paths and Framer Motion's path animation capabilities.

[See session-4.3-path-movement.md](./session-4.3-path-movement.md)

### Session 4.4: Reduced Motion and Performance Fallbacks
**Duration:** 2-3 hours
**Complexity:** Medium

Add accessibility support for reduced motion preferences and performance monitoring to automatically disable animations in complex scenarios.

[See session-4.4-reduced-motion.md](./session-4.4-reduced-motion.md)

## Key Concepts

### Animation Coordination

The animation system is **reactive** - it watches for state changes and triggers appropriate animations:

```typescript
// Detect what changed
const changes = detectStateChanges(prevState, currentState);

// Queue animations for changes
changes.forEach(change => queueAnimation(change));

// Execute sequentially
await executeAnimationQueue();
```

### Declarative Animations

Framer Motion uses a declarative API that fits React patterns:

```tsx
<motion.div
  initial={{ x: 0, opacity: 0 }}
  animate={{ x: 100, opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

### Layout Animations

Framer Motion's `layoutId` enables automatic animations when elements change position:

```tsx
<motion.div layoutId={task.id}>
  {/* Content */}
</motion.div>
```

When a task with the same `layoutId` moves to a new parent, Framer Motion automatically animates the transition.

### Speed Multiplier

Animations scale with the playback speed setting:

```typescript
const duration = BASE_DURATION / speed;  // speed = 0.25, 0.5, 1, 2, 4
```

## Success Criteria

Phase 4 is complete when:
- [ ] Animation coordinator queues and executes animations
- [ ] TaskNode component transitions smoothly between states
- [ ] Tasks animate along paths when moving between regions
- [ ] Animations execute sequentially (no overlapping/racing)
- [ ] Speed setting affects animation duration
- [ ] Reduced motion preference disables animations
- [ ] Performance fallback activates for complex scenarios (>50 tasks)
- [ ] No animation glitches or jumps
- [ ] Animations synchronized with state changes
- [ ] All animations use GPU-accelerated properties (transform, opacity)

## Testing Strategy

Each session should include:
- **Visual tests**: Manually verify animations look correct
- **Timing tests**: Verify animations complete in expected time
- **Reduced motion tests**: Verify animations skip when preference set
- **Performance tests**: Verify no frame drops or janky animations

Run tests with:
```bash
npm run test:unit -- --coverage
npm run test:e2e  # Playwright for visual verification
```

## Next Phase

After Phase 4 completes, move to **Phase 5: Controls & Timeline** to add playback controls and timeline scrubbing.

## Common Pitfalls

### ❌ Not waiting for animations to complete
```typescript
// BAD - starts next animation immediately
queueAnimation(task1);
queueAnimation(task2);
executeAnimations();
```

### ✅ Sequential execution
```typescript
// GOOD - waits for each animation
await animateTask(task1);
await animateTask(task2);
```

### ❌ Animating non-GPU properties
```typescript
// BAD - triggers layout recalculation
<motion.div animate={{ left: 100 }} />
```

### ✅ Use transform for performance
```typescript
// GOOD - GPU accelerated
<motion.div animate={{ x: 100 }} />
```

### ❌ Forgetting reduced motion
```typescript
// BAD - always animates
<motion.div animate={to} transition={{ duration: 0.5 }} />
```

### ✅ Respect preferences
```typescript
// GOOD - instant transition if reduced motion
const prefersReducedMotion = useReducedMotion();
<motion.div 
  animate={to} 
  transition={{ duration: prefersReducedMotion ? 0 : 0.5 }} 
/>
```

### ❌ Hardcoded timing
```typescript
// BAD - doesn't respect speed setting
transition: { duration: 0.5 }
```

### ✅ Use speed multiplier
```typescript
// GOOD - scales with speed
const { speed } = usePlayback();
transition: { duration: 0.5 / speed }
```

## Animation Taxonomy

### State Transitions (in-place)
Task changes state without moving:
- **Created → Queued**: Fade in, subtle scale
- **Queued → Running**: Color change, glow effect
- **Running → Completed**: Fade out, shrink

### Movements (between regions)
Task moves from one region to another:
- **WebAPI → MacroQueue**: Path-based movement
- **MacroQueue → CallStack**: Slide transition
- **CallStack → MicroQueue**: Path-based movement (when enqueueing microtask)

### Orchestrated Sequences
Multiple animations in coordination:
- **Microtask Drain**: Multiple tasks move from MicroQueue → CallStack in sequence
- **Frame Render**: Multiple tasks move to RenderPipeline simultaneously

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Animation Coordinator                      │
│  - Detects state changes                                │
│  - Queues animations                                    │
│  - Executes sequentially                                │
│  - Manages timing with speed multiplier                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Animation Config                           │
│  - Variant definitions                                  │
│  - Transition presets                                   │
│  - Duration constants                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              TaskNode Component                         │
│  - Uses Framer Motion                                   │
│  - Responds to animation commands                       │
│  - Renders with state-based styling                     │
└─────────────────────────────────────────────────────────┘
```

## Performance Targets

- **Simple scenarios (<20 tasks)**: 60 fps, all animations enabled
- **Medium scenarios (20-50 tasks)**: 60 fps, all animations enabled
- **Complex scenarios (>50 tasks)**: Automatic fallback to instant transitions

Monitor with:
```typescript
const fps = performance.now() / frameCount;
if (fps < 30) {
  disableAnimations();
}
```

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Animation Coordinator Pattern](../../architecture/overview.md#animation-layer)
- [Animation Triggering Flow](../../architecture/data-flow.md#animation-coordination)
- [Reduced Motion Guidelines](https://web.dev/prefers-reduced-motion/)
- [GPU-Accelerated CSS Properties](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/)
