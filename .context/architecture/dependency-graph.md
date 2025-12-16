# Dependency Graph

This document maps dependencies between sessions to show the critical path and which sessions can be parallelized.

## Dependency Levels

Sessions are organized into dependency levels. Each level depends on all previous levels being complete.

### Level 0: Foundation
No dependencies - can start immediately

- **Session 1.1**: Type definitions
- **Project setup**: `package.json`, configs (out of band)

### Level 1: Core Data Structures
Depends on: Level 0 (types)

- **Session 1.2**: Queue and Stack implementations

### Level 2: Simulator Logic
Depends on: Level 1 (queues, types)

- **Session 1.3**: Enqueue rules and Web API operations
- **Session 6.1**: Scenario schema and validation (independent path)

### Level 3: Core Engine
Depends on: Level 2 (enqueue rules)

- **Session 1.4**: Tick function and priority rules
- **Session 1.5**: Render and microtask logic

### Level 4: State Management
Depends on: Level 3 (complete simulator)

- **Session 2.1**: History system
- **Session 2.2**: Simulator reducer
- **Session 2.3**: Context providers

### Level 5: UI Foundation
Depends on: Level 4 (state management)

- **Session 3.1**: Project setup and layout
- **Session 3.3**: Panel structure
- **Session 3.4**: Common UI components

### Level 6: Visualization
Depends on: Level 5 (UI foundation)

- **Session 3.2**: Visualization canvas regions
- **Session 8.1**: Explanation panel

### Level 7: Animation
Depends on: Level 6 (visualization)

- **Session 4.1**: Animation coordinator
- **Session 4.2**: Task node component
- **Session 4.3**: Path-based movement
- **Session 4.4**: Reduced motion support

### Level 8: Controls
Depends on: Level 7 (animation)

- **Session 5.1**: Playback controls
- **Session 5.2**: Speed control

### Level 9: Timeline
Depends on: Level 8 (controls)

- **Session 5.3**: Timeline scrubber

### Level 10: Scenarios
Depends on: Level 9 (complete core + UI)

- **Session 6.2**: Scenario builder UI
- **Session 6.3**: Preset scenarios 1-4
- **Session 6.4**: Preset scenarios 5-8

### Level 11: Polish
Depends on: Level 10 (scenarios)

- **Session 7.1**: Keyboard navigation
- **Session 7.2**: ARIA and screen readers
- **Session 7.3**: Mobile responsive
- **Session 8.2**: Task inspector
- **Session 8.3**: Developer mode

## Critical Path

The longest dependency chain (critical path):

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 2.1 → 2.2 → 2.3 → 3.1 → 3.2 → 4.1 → 4.2 → 4.3 → 5.1 → 5.3 → 6.2 → 6.3 → 7.1
```

**Total sessions on critical path:** 18
**Estimated critical path time:** 36-72 hours of focused work

## Parallelization Opportunities

### After Level 0 (Types)
Can parallelize:
- Session 1.2 (Queues)
- Session 6.1 (Scenario schema) ← Independent path

### After Level 4 (State)
Can parallelize:
- Session 3.1 (Layout)
- Session 3.3 (Panels)
- Session 3.4 (Common components)

### After Level 9 (Timeline)
Can parallelize:
- Session 6.2 (Builder)
- Session 6.3 (Presets 1-4)
- Session 6.4 (Presets 5-8)

### After Level 10 (Scenarios)
Can parallelize:
- All Phase 7 sessions (accessibility)
- Session 8.2 (Inspector)
- Session 8.3 (Dev mode)

## Session Dependency Matrix

| Session | Depends On | Can Start After |
|---------|-----------|-----------------|
| 1.1 | None | Immediately |
| 1.2 | 1.1 | Types defined |
| 1.3 | 1.1, 1.2 | Queues implemented |
| 1.4 | 1.3 | Enqueue rules done |
| 1.5 | 1.4 | Tick function done |
| 2.1 | 1.5 | Core simulator complete |
| 2.2 | 2.1 | History system done |
| 2.3 | 2.2 | Reducers done |
| 3.1 | 2.3 | State layer complete |
| 3.2 | 3.1 | Layout exists |
| 3.3 | 3.1 | Layout exists |
| 3.4 | None | Anytime (UI primitives) |
| 4.1 | 3.2 | Canvas exists |
| 4.2 | 4.1 | Coordinator exists |
| 4.3 | 4.2 | Task nodes exist |
| 4.4 | 4.3 | Animations working |
| 5.1 | 4.4 | Animation complete |
| 5.2 | 5.1 | Playback exists |
| 5.3 | 5.2 | Controls working |
| 6.1 | 1.1 | Types defined |
| 6.2 | 5.3, 6.1 | UI + schema done |
| 6.3 | 6.1 | Schema defined |
| 6.4 | 6.3 | Presets 1-4 done |
| 7.1 | 6.2 | UI complete |
| 7.2 | 7.1 | Keyboard working |
| 7.3 | 7.1 | Keyboard working |
| 8.1 | 3.3 | Panels exist |
| 8.2 | 8.1 | Explanation done |
| 8.3 | 8.2 | Inspector done |

## Optimal Parallel Strategy

If you have multiple developers or AI sessions:

**Week 1:**
- Developer A: Sessions 1.1 → 1.2 → 1.3 (Core foundation)
- Developer B: Session 6.1 (Scenario schema)
- Developer C: Session 3.4 (UI components)

**Week 2:**
- Developer A: Sessions 1.4 → 1.5 (Complete simulator)
- Developer B: Wait for A, prepare tests

**Week 3:**
- Developer A: Sessions 2.1 → 2.2 → 2.3 (State)
- Developer B: Start documenting presets

**Week 4:**
- Developer A: Session 3.1 (Layout)
- Developer B: Session 3.3 (Panels)
- Developer C: Continue 3.4 if needed

**Week 5:**
- Developer A: Sessions 3.2 → 4.1 → 4.2 (Visualization + Animation)
- Developer B: Session 8.1 (Explanation)

**Week 6:**
- Developer A: Sessions 4.3 → 4.4 (Complete animation)
- Developer B: Wait for A

**Week 7:**
- Developer A: Sessions 5.1 → 5.2 → 5.3 (Controls + Timeline)

**Week 8:**
- Developer A: Session 6.2 (Builder)
- Developer B: Session 6.3 (Presets 1-4)
- Developer C: Session 6.4 (Presets 5-8)

**Week 9:**
- Developer A: Session 7.1 (Keyboard)
- Developer B: Session 7.2 (ARIA)
- Developer C: Session 7.3 (Mobile)

**Week 10:**
- Developer A: Session 8.2 (Inspector)
- Developer B: Session 8.3 (Dev mode)
- Developer C: Integration testing

## Blocking Sessions

These sessions block the most other work:

1. **Session 1.1 (Types)** - Blocks everything
2. **Session 1.5 (Core complete)** - Blocks all state/UI
3. **Session 2.3 (State complete)** - Blocks all UI
4. **Session 3.2 (Canvas)** - Blocks animation
5. **Session 4.4 (Animation complete)** - Blocks controls
6. **Session 5.3 (Timeline)** - Blocks scenarios

**Priority order:** Complete blocking sessions first.

## Independent Workstreams

These can progress in parallel with minimal coordination:

**Workstream 1: Core Simulator**
Sessions: 1.1 → 1.2 → 1.3 → 1.4 → 1.5

**Workstream 2: Scenario System**
Sessions: 6.1 → 6.3 → 6.4 (can start early)

**Workstream 3: UI Components**
Session 3.4 (can start anytime)

**Workstream 4: Documentation**
Session 8.1 (explanation text, can draft early)

## Testing Dependencies

Tests should be written during each session, but integration/E2E tests have dependencies:

- **Unit tests**: Can be written during each session
- **Integration tests**: After Phase 2 (state complete)
- **E2E tests**: After Phase 5 (controls complete)
- **Accessibility tests**: After Phase 7

## Minimum Viable Product (MVP)

To get a working demo, you need these sessions minimum:

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 2.1 → 2.2 → 2.3 → 3.1 → 3.2 → 5.1 → 6.3 (one preset)
```

**MVP sessions:** 12 of 29
**Skippable for MVP:** Animation polish, timeline scrubbing, scenario builder, accessibility

## Recommendations

1. **Solo developer:** Follow the critical path sequentially
2. **Team of 2-3:** Use parallel strategy above
3. **Time-constrained:** Build MVP first (12 sessions)
4. **Quality-focused:** Follow sequence, don't skip testing

## Version 1.0 Definition

All 29 sessions complete = Version 1.0 ready for production
