# Event Loop Rules Reference

This document specifies the exact rules that the simulator must follow. These rules are derived from the requirements document and form the "specification" for the simulator behavior.

## Core Principle

The simulator implements a **simplified browser-like event loop** model with documented deviations from real browsers.

## Priority Rules (Deterministic Order)

The `tick()` function must follow these rules **in order**. The first applicable rule determines the action for that tick.

### Rule 1: Complete Current Call Stack Frame
**Condition:** Call stack is non-empty AND top frame has remaining steps
**Action:** Execute one step of the current frame, decrement `stepsRemaining`
**Effect:** Task continues running

If `stepsRemaining` reaches 0:
- Pop frame from stack
- Mark task as COMPLETED
- Process task effects (enqueue new tasks, log output, etc.)
- Continue to Rule 2

### Rule 2: Drain Microtask Queue
**Condition:** Call stack is empty AND microtask queue is non-empty
**Action:** Dequeue one microtask, push to call stack
**Effect:** Microtask begins executing

**Critical:** Microtasks are processed one at a time, but Rule 2 repeats until the microtask queue is empty (before checking other rules).

### Rule 3: Check for Render
**Condition:** All of the following are true:
- Call stack is empty
- Microtask queue is empty
- `renderPending === true`
- `now >= lastFrameAt + frameInterval`

**Action:** Execute render step
**Effect:**
- Log "Render (style/layout/paint)"
- Set `renderPending = false`
- Set `lastFrameAt = now`
- Increment `frameCounter`

### Rule 4: Execute rAF Callback
**Condition:** All of the following are true:
- Call stack is empty
- Microtask queue is empty
- Render just occurred OR next frame boundary AND rAF queue is non-empty

**Action:** Dequeue one rAF callback, push to call stack
**Effect:** rAF callback begins executing

**Note:** In this model, rAF callbacks run in the "frame phase" after render decision is made.

### Rule 5: Execute Macrotask
**Condition:** Call stack is empty AND microtask queue is empty AND macrotask queue is non-empty
**Action:** Dequeue one macrotask, push to call stack
**Effect:** Macrotask begins executing

### Rule 6: Advance Time
**Condition:** All queues are empty, no tasks running, Web APIs have pending operations
**Action:** 
- Find earliest `readyAt` among all Web API operations
- Set `now = readyAt`
- Enqueue all Web API operations that are now ready (where `readyAt <= now`)
- When multiple ops become ready simultaneously, enqueue in order of `enqueueSeq`

**Effect:** Time advances to next event

### Rule 7: Simulation Complete
**Condition:** All queues empty, call stack empty, no Web API operations pending
**Action:** Mark simulation as complete
**Effect:** No more ticks possible

## Enqueue Rules by Task Type

### setTimeout / timer
**When created:**
1. Create Web API operation with `readyAt = now + delay`
2. Store operation with unique ID

**When ready (`now >= readyAt`):**
1. Create macrotask with the callback
2. Enqueue to macrotask queue
3. Remove Web API operation

**Delay of 0:** Still goes through Web API, becomes ready at current `now` but enqueued as macrotask

### setInterval
**Similar to setTimeout but:**
- `recurring = true` on Web API operation
- When enqueued, create new Web API operation for next interval
- Continue until explicitly canceled

### Promise.then / queueMicrotask
**When created:**
1. Create microtask immediately
2. Enqueue to microtask queue (no Web API delay)
3. Use current `now` as `createdAt`

**No waiting:** Directly enters microtask queue

### async/await continuation
**When `await` is encountered:**
1. Current function yields (frame pops if synchronous portion complete)
2. Awaited promise resolution creates a microtask for continuation
3. Continuation enqueued to microtask queue

**Effect:** Each `await` creates a microtask for what comes after

### fetch (simplified model)
**When called:**
1. Create Web API operation with `readyAt = now + latency`
2. Mark as network operation

**When ready:**
1. Create macrotask for the `.then()` callback
2. Enqueue to macrotask queue

**Deviation from real browsers:** Real fetch might use microtasks for promise resolution; this model uses macrotask for simplicity.

### DOM event
**When event is triggered:**
1. Create Web API operation (or directly enqueue if synchronous)
2. Mark `readyAt` based on event timing

**When ready:**
1. Create macrotask for event handler
2. Enqueue to macrotask queue

### requestAnimationFrame
**When called:**
1. Register callback in rAF queue for next frame
2. No immediate enqueue

**At frame boundary:**
1. Move rAF callbacks to execution queue
2. Execute before paint (part of render phase in this model)

## Frame and Rendering Rules

### Frame Interval
Default: 16ms (60fps)
Configurable in simulation

### Render Pending
Set to `true` when:
- A task effect has `type: 'invalidate-render'`
- Any task modifies DOM-like state (in this simulation, explicitly marked)

### Render Occurs When
1. `renderPending === true`
2. AND call stack empty
3. AND microtask queue empty
4. AND current `now >= lastFrameAt + frameInterval`

### Render Phase (simplified)
In real browsers, render includes:
- Style calculation
- Layout
- Paint
- Composite

In this model: Single "Render" step that logs completion

## Tie-Breaking Rules

When multiple items are eligible at the same time:

### Queue Ordering
FIFO (First In, First Out) - earliest enqueued runs first

### Simultaneous Enqueue
Use `enqueueSeq` monotonic counter:
- Each task gets unique sequence number
- Lower sequence number = enqueued first

### Web API Operations Ready Simultaneously
Process in order of `enqueueSeq` of their payload tasks

## Microtask Draining Details

### Behavior
"Draining" means: keep dequeuing and executing microtasks until the queue is empty.

### During Draining
If a microtask enqueues more microtasks, they are also executed before moving to macrotasks.

### Example
```
Macro queue: [M1, M2]
Micro queue: [μ1, μ2]

Tick 1: Execute μ1 (dequeue from micro)
  μ1 enqueues μ3
  Micro queue now: [μ2, μ3]

Tick 2: Execute μ2 (still draining)
  
Tick 3: Execute μ3 (still draining)
  Micro queue now empty

Tick 4: Execute M1 (first macrotask)
```

### Starvation Risk
If microtasks keep enqueuing more microtasks infinitely, rendering will be delayed (intentional behavior for demo purposes).

## Edge Cases

### Empty Delay Timer
`setTimeout(fn, 0)`:
- Still goes through Web API
- Ready immediately but enqueued as macrotask
- Runs after current microtasks

### Nested Timers
Timer callback enqueues another timer:
- Inner timer creates new Web API operation
- Enqueues to macrotask queue when ready
- Processed in FIFO order

### Async Function with Multiple Awaits
```javascript
async function foo() {
  await promise1;  // Yields, continuation is microtask
  console.log('A');
  await promise2;  // Yields again, new continuation microtask
  console.log('B');
}
```
- First await: enqueues continuation for line after await
- That continuation runs as microtask
- Second await: enqueues next continuation
- Each await introduces one microtask

### RAF and Render
- rAF callbacks run before paint in this model
- If rAF callback calls `requestAnimationFrame` again, it registers for *next* frame

### Task Duration
`durationSteps` determines how many ticks a task takes to execute:
- `durationSteps = 1`: Completes in one tick (most common)
- `durationSteps > 1`: Simulates longer execution (rare, for demo purposes)

## Determinism Guarantees

### Same Input → Same Output
Given identical:
- Scenario definition
- Seed (if any randomness, though none is planned)
- Simulator version

The simulation will produce:
- Identical step sequence
- Identical timing
- Identical log output

### No Non-Determinism Sources
Forbidden:
- `Date.now()` - use `state.now`
- `Math.random()` - use `enqueueSeq` for ordering
- Real timers - use logical time
- Real network - use simulated latency
- User input during playback - freeze during playback

## Model Simplifications (Documented Deviations)

### Single Macrotask Queue
Real browsers may have separate queues for:
- Timers
- User interactions
- Network events
- etc.

This model: One unified macrotask queue

### Simplified Render Pipeline
Real browsers: complex multi-step rendering
This model: Single "Render" step

### Fetch as Macrotask
Real spec: Fetch may use microtasks for promise resolution
This model: Fetch completion enqueues macrotask for simplicity

### No Multi-threading
No Workers, SharedArrayBuffer, Atomics
Single-threaded simulation only

### Fixed Frame Rate
Real browsers: adaptive frame rate based on load
This model: Fixed interval (configurable)

## Rule Validation

The simulator must be testable against these rules. Each rule should have corresponding tests:

- **Rule 1 test:** Task with `durationSteps=3` takes 3 ticks to complete
- **Rule 2 test:** Microtask executes before macrotask even if macrotask enqueued first
- **Rule 3 test:** Render doesn't happen until microtasks drain
- **Rule 4 test:** rAF runs in frame phase
- **Rule 5 test:** Macrotasks run FIFO
- **Rule 6 test:** Time advances to next Web API operation
- **Microtask draining test:** 10 nested microtasks all execute before first macrotask

## References

These rules implement the model specified in the requirements document Section 4: "Simulation Model Spec"
