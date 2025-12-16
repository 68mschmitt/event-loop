# Glossary

## Core Concepts

### Event Loop
The mechanism that coordinates execution of code, events, and rendering in JavaScript environments (browsers, Node.js). It processes tasks from various queues in a specific order.

### Task (General)
A unit of work to be executed. In this app, represented by the `Task` type with various subtypes.

### Macrotask
A task that goes into the macrotask (task) queue. Examples: setTimeout callbacks, setInterval callbacks, DOM event handlers, fetch completions (in this model).

Also called: "Task" in HTML spec, but we use "macrotask" to distinguish from our generic `Task` type.

### Microtask
A task that goes into the microtask queue. Microtasks have higher priority than macrotasks and are fully drained before the next macrotask runs. Examples: Promise.then callbacks, queueMicrotask, async function continuations.

### Web API
Host environment features that run outside the JavaScript engine. Examples: timers (setTimeout), network (fetch), DOM events. In this simulator, represented by `WebApiOperation` objects that track pending work.

### Call Stack
LIFO (Last In, First Out) structure holding currently executing function frames. When a function is called, a frame is pushed. When it returns, the frame is popped.

### Queue
FIFO (First In, First Out) structure. Tasks are enqueued at the back and dequeued from the front.

### Frame
A call stack frame representing one executing function/task. Contains the task and execution state (`stepsRemaining`).

## Simulation Concepts

### Logical Time
Simulated time (`now` field) in milliseconds. Unlike wall-clock time (Date.now()), this is controlled by the simulator and can be advanced explicitly.

### Enqueue Sequence
Monotonic counter (`enqueueSeq`) assigned to each task when created. Used for deterministic tie-breaking when multiple tasks become ready simultaneously.

### Step
One discrete action in the simulation. Each call to `tick()` advances the simulation by one step. Examples of steps: execute a task, drain one microtask, perform render.

### Snapshot
A saved copy of simulator state at a particular step, used for history/time-travel (step back, scrubbing).

### Determinism
Property that the same input always produces the same output. The simulator is fully deterministic: same scenario → same steps → same outcome.

### Duration Steps
Property (`durationSteps`) indicating how many simulation steps a task takes to execute. Most tasks have `durationSteps = 1`.

## Priority and Ordering

### Priority Rules
The ordered set of rules determining what executes next. See `reference/event-loop-rules.md` for complete specification.

### Microtask Draining
Process of executing all microtasks in the microtask queue (including newly enqueued ones) before proceeding to other work.

### FIFO (First In, First Out)
Queue ordering: earliest enqueued item is processed first.

### LIFO (Last In, First Out)
Stack ordering: most recently added item is processed first.

### Tie-Breaking
When multiple items are eligible to run, use `enqueueSeq` to determine order.

## Task Types

### Sync Task
Represents synchronous code execution. Executes immediately when encountered.

### Timer Task
setTimeout callback. Goes through Web API with delay, then enqueues as macrotask.

### Interval Task
setInterval callback. Like timer but repeats.

### Microtask Task
Promise.then, queueMicrotask callback. Directly enqueues to microtask queue.

### Async Continuation
Continuation of an async function after an await. Enqueues as microtask.

### Fetch Task
Network request completion. Goes through Web API with latency, then enqueues as macrotask (in this model).

### DOM Event Task
Event handler. Enqueues as macrotask.

### rAF Task
requestAnimationFrame callback. Enqueues to rAF queue for next frame.

## Rendering

### Frame
One cycle of the rendering pipeline. In browsers, typically 60 times per second (every ~16ms).

### Frame Interval
Time between frames in milliseconds. Default: 16ms (60fps).

### Render Pending
Boolean flag indicating that rendering is needed (e.g., DOM was modified).

### Frame Boundary
Logical point in time when a frame completes. Determined by `now >= lastFrameAt + frameInterval`.

### Render Step
Simplified representation of the browser's rendering pipeline (style, layout, paint, composite). In this simulator, a single "Render" action.

### rAF (requestAnimationFrame)
API for scheduling callbacks to run before the next paint. Callbacks run during the "frame phase."

## State Management

### Reducer
Pure function that takes (state, action) and returns new state. Handles state transitions.

### Action
Object describing a state change. Has a `type` field and optional `payload`.

### Dispatch
Function to send an action to a reducer, triggering a state update.

### Context
React mechanism for passing data through the component tree without props.

### History
Array of snapshots storing past states, enabling step-back and scrubbing.

## Scenarios

### Scenario
Complete definition of tasks to simulate, including metadata (name, description, learning objective).

### Preset
Pre-defined scenario demonstrating a specific concept. See `reference/preset-scenarios.md`.

### Scenario Builder
UI for creating custom scenarios by adding/removing tasks.

### Validation
Process of checking if a scenario is valid (e.g., non-negative delays, required fields present).

## UI/UX

### Canvas
Main visualization area showing queues, stacks, and task movements.

### Region
Visual area representing one simulator structure (e.g., Call Stack region, Microtask Queue region).

### Task Node
Visual card representing one task, showing label, type, and state.

### Playback Controls
UI buttons for play, pause, step forward, step back, reset.

### Speed
Multiplier for animation and playback speed (0.25×, 0.5×, 1×, 2×, 4×).

### Timeline
Visual representation of simulation progress with scrubber for jumping to steps.

### Scrubber
Draggable control on timeline for jumping to a specific step.

### Explanation Panel
Panel showing step-by-step explanation of what happened and why (which rule applied).

### Task Inspector
Panel showing detailed metadata and lifecycle of a selected task.

### Reduced Motion
Accessibility setting (or system preference) that disables animations, replacing them with instant transitions.

## Animation

### Transition
Change from one visual state to another (e.g., task moving from Web APIs to Macro Queue).

### Path-Based Animation
Animation where an element follows a calculated path between two positions.

### Animation Coordinator
System that sequences animations based on state changes.

### Layout Animation
Animation that automatically handles position changes when layout shifts (e.g., Framer Motion's layoutId).

## Testing

### Unit Test
Test of a single function or module in isolation.

### Integration Test
Test of multiple modules working together.

### E2E (End-to-End) Test
Test of complete user flows in a real browser (e.g., with Playwright).

### Test Specification
Description of what should be tested: Given/When/Then format.

### Acceptance Criteria
Conditions that must be true for a feature to be considered complete.

## Architecture Terms

### Core Layer
Pure TypeScript logic with no UI dependencies. Includes simulator engine and types.

### State Layer
React state management layer connecting core to UI. Uses Context and Reducers.

### UI Layer
React components for presentation and user interaction.

### Animation Layer
System coordinating visual transitions based on state changes.

### Barrel Export
`index.ts` file that re-exports items from other files for cleaner imports.

### Discriminated Union
TypeScript pattern using a common field (discriminant) to narrow union types.

### Type Guard
Function that narrows a type (e.g., `isTimerTask(task)` narrows `Task` to `TimerTask`).

## Development

### Session
One unit of work in the implementation plan. See `.context/phases/`.

### Phase
Group of related sessions. The project has 8 phases.

### Dependency Graph
Map showing which sessions depend on others.

### Critical Path
Longest dependency chain; determines minimum project duration.

### MVP (Minimum Viable Product)
Minimal set of features for a working demo.

## Abbreviations

- **API**: Application Programming Interface
- **ARIA**: Accessible Rich Internet Applications
- **DOM**: Document Object Model
- **E2E**: End-to-End
- **FIFO**: First In, First Out
- **FPS**: Frames Per Second
- **HMR**: Hot Module Replacement
- **JSX**: JavaScript XML
- **LIFO**: Last In, First Out
- **MVP**: Minimum Viable Product
- **rAF**: requestAnimationFrame
- **TSX**: TypeScript XML (TypeScript + JSX)
- **UI**: User Interface
- **UX**: User Experience

## Related Documents

- **Event Loop Rules**: `reference/event-loop-rules.md`
- **Preset Scenarios**: `reference/preset-scenarios.md`
- **Architecture**: `architecture/overview.md`
- **Tech Stack**: `tech-stack.md`
