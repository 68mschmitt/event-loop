# Architecture Overview

## System Architecture

The Event Loop Visualizer is architected as a **layered system** with clear separation between simulation logic, state management, and presentation.

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer (React)                    │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐           │
│  │Components │  │ Controls  │  │ Timeline │           │
│  └───────────┘  └───────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│              Animation Layer (Framer Motion)            │
│  ┌──────────────┐  ┌─────────────┐                     │
│  │ Coordinator  │  │  Transitions │                     │
│  └──────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│         State Layer (Context + Reducer + History)       │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────┐      │
│  │ Sim Reducer  │  │  UI Reducer │  │  History │      │
│  └──────────────┘  └─────────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│              Core Layer (Pure TypeScript)               │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────┐      │
│  │  Simulator   │  │  Scenarios  │  │   Types  │      │
│  └──────────────┘  └─────────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Determinism First
The simulator is a **pure state machine**. Given the same input state and action, it always produces the same output state. No side effects, no randomness, no wall-clock time dependencies.

### 2. Separation of Concerns
- **Core**: Business logic (event loop rules)
- **State**: State management and history
- **UI**: Presentation and user interaction
- **Animation**: Visual transitions

### 3. Unidirectional Data Flow
```
User Action → Dispatch → Reducer → New State → UI Update → Animation
```

### 4. Testability
Each layer can be tested independently:
- Core: Unit tests with pure functions
- State: Reducer tests with action creators
- UI: Component tests with mocked state
- Integration: E2E tests of full flow

## Layer Descriptions

### Core Layer

**Responsibility:** Implement the event loop simulation model

**Key Components:**
- **Types**: All TypeScript interfaces (Task, SimulatorState, etc.)
- **Simulator Engine**: 
  - `tick()`: Advance simulation by one step
  - Priority rules: Which task runs next
  - Enqueue rules: How tasks enter queues
  - Frame/render logic: When rendering occurs
- **Scenarios**: Preset definitions and validation

**Characteristics:**
- Zero React dependencies
- Pure functions only
- Fully deterministic
- Independently testable

**Example:**
```typescript
// Pure function - no side effects
function tick(state: SimulatorState): SimulatorState {
  // Apply priority rules
  // Update queues
  // Return new state (immutably)
}
```

### State Layer

**Responsibility:** Manage application state with history

**Key Components:**
- **SimulatorContext**: Holds simulator state and dispatch
- **UIContext**: Holds UI state (playing, speed, selected task)
- **Reducers**: Handle state transitions
- **History System**: Store snapshots for time-travel
- **Custom Hooks**: Provide convenient access to state

**Characteristics:**
- Uses React Context + useReducer
- Immutable updates (via Immer)
- Action-based state changes
- Maintains history for step-back/scrubbing

**Example:**
```typescript
function simulatorReducer(state: SimulatorState, action: Action): SimulatorState {
  switch (action.type) {
    case 'STEP_FORWARD':
      return produce(state, draft => {
        // Call core simulator
        const next = tick(draft);
        // Store in history
        addToHistory(draft, next);
      });
  }
}
```

### Animation Layer

**Responsibility:** Coordinate visual transitions

**Key Components:**
- **Animation Coordinator**: Sequences animations based on state changes
- **Transition Definitions**: Predefined animation configurations
- **Path Calculator**: Computes paths for task movements
- **Custom Hooks**: Provide animation state to components

**Characteristics:**
- Declarative animations (Framer Motion)
- Respects reduced-motion preferences
- Performance fallbacks for complex scenarios
- Synchronized with state updates

**Example:**
```typescript
function useTaskAnimation(task: Task) {
  const { from, to } = useTaskTransition(task);
  return {
    initial: from,
    animate: to,
    transition: getTransitionConfig(task.type)
  };
}
```

### UI Layer

**Responsibility:** Render visualizations and handle user input

**Key Components:**
- **Layout**: Overall app structure
- **Visualization Canvas**: Animated queues and stacks
- **Controls**: Play/pause/step buttons
- **Panels**: Explanation, inspector, presets
- **Timeline**: Scrubber and markers

**Characteristics:**
- Pure presentation (logic in state layer)
- Accessible (keyboard, ARIA, reduced motion)
- Responsive design
- Event handlers dispatch actions

**Example:**
```tsx
function PlaybackControls() {
  const { isPlaying } = usePlayback();
  const dispatch = useSimulatorDispatch();
  
  return (
    <button onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  );
}
```

## Data Flow Example

Let's trace what happens when a user clicks "Step Forward":

1. **User clicks button** → `onClick` handler fires
2. **Dispatch action** → `dispatch({ type: 'STEP_FORWARD' })`
3. **Reducer runs** → `simulatorReducer` receives current state + action
4. **Core simulation** → Reducer calls `tick(state)` from core layer
5. **New state** → Immutable update creates new state object
6. **History update** → Snapshot stored in history array
7. **Context update** → Context notifies all consumers
8. **Components re-render** → UI updates to show new state
9. **Animation triggers** → Framer Motion detects layout changes
10. **Visual transition** → Tasks animate to new positions

## State Shape

### Simulator State
```typescript
interface SimulatorState {
  // Core structures
  callStack: Stack<Frame>;
  webApis: Map<string, WebApiOperation>;
  macroQueue: Queue<Task>;
  microQueue: Queue<Task>;
  rafQueue: Queue<Task>;
  
  // Metadata
  now: number;              // Logical time
  stepIndex: number;        // Current step
  frameCounter: number;     // Frame count
  renderPending: boolean;   // Needs render
  
  // History
  history: SimulatorSnapshot[];
  
  // Logs
  log: LogEntry[];
}
```

### UI State
```typescript
interface UIState {
  // Playback
  isPlaying: boolean;
  speed: number;            // 0.25, 0.5, 1, 2, 4
  
  // Selection
  selectedTaskId: string | null;
  
  // Settings
  reducedMotion: boolean;
  showExplanations: boolean;
  developerMode: boolean;
  
  // Current scenario
  currentScenario: Scenario | null;
}
```

## Communication Patterns

### Parent → Child (Props)
Standard React props for passing data down

### Child → Parent (Callbacks)
Event handlers passed as props, dispatch actions

### Sibling → Sibling (Context)
Shared state via Context, no prop drilling

### Global State (Context)
- SimulatorContext: Simulation state + dispatch
- UIContext: UI state + dispatch

## Performance Considerations

### Memoization
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for pure components

### Context Splitting
- Separate simulator and UI contexts
- Prevents unnecessary re-renders
- Components subscribe only to needed context

### Animation Performance
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Batch state updates
- Disable animations for complex scenarios (auto-fallback)

### History Bounds
- Cap history at 5000 steps
- Discard oldest when exceeded
- User-visible indication when limited

## Error Handling

### Core Layer
- Type safety prevents most errors
- Assertions for invariants
- Validation for scenarios

### State Layer
- Try/catch in reducers
- Error actions for failed operations
- Recover to last valid state

### UI Layer
- Error boundaries for component failures
- Graceful degradation
- User-friendly error messages

## Extension Points

The architecture supports future extensions:

1. **New task types**: Add to type definitions + enqueue rules
2. **New scenarios**: Add to presets directory
3. **Custom animations**: Add to transition definitions
4. **New UI panels**: Add to panels directory
5. **New export formats**: Add to utils

## Dependency Inversion

Higher layers depend on lower layers, but lower layers are independent:

```
UI → Animation → State → Core
      ↓           ↓
    (optional) (required)
```

This allows:
- Testing core without UI
- Different UI implementations (e.g., CLI)
- Swapping animation libraries
- Alternative state management

## Architectural Decisions Record

**AD-001: Pure core simulator**
- Decision: Core simulator has zero dependencies on React/UI
- Rationale: Testability, portability, determinism
- Tradeoff: More boilerplate in state layer

**AD-002: Context over Redux**
- Decision: Use React Context + useReducer instead of Redux
- Rationale: Simpler for this scope, built-in time-travel support
- Tradeoff: Less tooling, more manual setup

**AD-003: Framer Motion for animations**
- Decision: Use Framer Motion instead of React Spring or CSS
- Rationale: Declarative API, layout animations, orchestration
- Tradeoff: Bundle size, learning curve

**AD-004: Tailwind for styling**
- Decision: Use Tailwind CSS instead of CSS Modules or Styled Components
- Rationale: Rapid development, consistency, tree-shaking
- Tradeoff: Verbose className attributes

**AD-005: Immer for immutability**
- Decision: Use Immer in reducers instead of manual spreading
- Rationale: Simpler code, fewer errors, readability
- Tradeoff: Small runtime cost, magic behavior
