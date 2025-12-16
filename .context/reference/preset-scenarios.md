# Preset Scenarios Specification

This document specifies all 8+ preset scenarios that must be implemented. Each preset demonstrates a key concept about event loop ordering.

## Preset Format

Each preset includes:
- **ID**: Unique identifier
- **Name**: Display name
- **Description**: What it demonstrates
- **Learning Objective**: What the user should learn
- **Scenario Definition**: Task structure
- **Expected Sequence**: Deterministic step order
- **Key Explanations**: What the explanation panel should show
- **Acceptance Criteria**: How to verify correctness

---

## Preset 1: Sync vs setTimeout(0)

### ID
`sync-vs-settimeout`

### Name
"Synchronous vs setTimeout(0)"

### Description
Demonstrates that even setTimeout with zero delay doesn't execute immediately - it's scheduled as a macrotask after the current synchronous code completes.

### Learning Objective
Understand that setTimeout is always asynchronous, even with delay 0.

### Scenario Definition
```javascript
// Conceptual code (actual implementation uses scenario JSON)
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

console.log('End');

// Expected output:
// Start
// End
// Timeout
```

### Task Structure
```typescript
{
  id: 'sync-vs-settimeout',
  name: 'Sync vs setTimeout(0)',
  tasks: [
    {
      type: TaskType.SYNC,
      label: 'console.log("Start")',
      effects: [{ type: 'log', payload: 'Start' }]
    },
    {
      type: TaskType.TIMER,
      label: 'setTimeout(callback, 0)',
      delay: 0,
      effects: [{ type: 'log', payload: 'Timeout' }]
    },
    {
      type: TaskType.SYNC,
      label: 'console.log("End")',
      effects: [{ type: 'log', payload: 'End' }]
    }
  ]
}
```

### Expected Sequence
1. Execute sync task: log "Start"
2. Create timer Web API operation (ready immediately)
3. Execute sync task: log "End"
4. Timer becomes ready → enqueue to macrotask queue
5. Execute macrotask: log "Timeout"

### Key Explanations
- Step 1: "Executing synchronous code"
- Step 3: "setTimeout creates a Web API operation, doesn't execute immediately"
- Step 5: "Macrotask executes after all synchronous code completes"

### Acceptance Criteria
- [ ] Logs appear in order: Start, End, Timeout
- [ ] Timer goes through Web API region
- [ ] Timer enters macrotask queue before executing
- [ ] Explanation mentions "macrotask"

---

## Preset 2: Promise.then vs setTimeout(0)

### ID
`promise-vs-settimeout`

### Name
"Promise.then vs setTimeout(0)"

### Description
Shows that microtasks (Promise.then) execute before macrotasks (setTimeout), even when both are scheduled at the same time.

### Learning Objective
Microtasks have higher priority than macrotasks.

### Scenario Definition
```javascript
setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('Sync');

// Expected output:
// Sync
// Promise
// Timeout
```

### Task Structure
```typescript
{
  tasks: [
    {
      type: TaskType.TIMER,
      label: 'setTimeout(callback, 0)',
      delay: 0,
      effects: [{ type: 'log', payload: 'Timeout' }]
    },
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then()',
      effects: [{ type: 'log', payload: 'Promise' }]
    },
    {
      type: TaskType.SYNC,
      label: 'console.log("Sync")',
      effects: [{ type: 'log', payload: 'Sync' }]
    }
  ]
}
```

### Expected Sequence
1. Timer enqueued to Web API (ready at now + 0)
2. Microtask enqueued directly to microtask queue
3. Sync task executes: log "Sync"
4. Timer becomes ready → macrotask queue
5. Microtask executes: log "Promise" (microtasks drain first!)
6. Macrotask executes: log "Timeout"

### Key Explanations
- "Microtasks are drained before the next macrotask"
- "Promise.then enqueues a microtask"
- "setTimeout enqueues a macrotask"

### Acceptance Criteria
- [ ] Logs: Sync, Promise, Timeout (this order exactly)
- [ ] Microtask executes before macrotask
- [ ] Explanation explicitly states "microtasks drained before next macrotask"

---

## Preset 3: Nested Microtasks

### ID
`nested-microtasks`

### Name
"Nested Microtasks (Chain)"

### Description
Demonstrates microtask draining: microtasks that enqueue more microtasks continue draining before any macrotask runs.

### Learning Objective
Microtask queue is fully drained (including newly enqueued microtasks) before proceeding to macrotasks.

### Scenario Definition
```javascript
Promise.resolve().then(() => {
  console.log('Micro 1');
  Promise.resolve().then(() => {
    console.log('Micro 2');
  });
});

setTimeout(() => {
  console.log('Timeout');
}, 0);

// Expected output:
// Micro 1
// Micro 2
// Timeout
```

### Expected Sequence
1. Microtask 1 enqueued
2. Timer enqueued to Web API
3. Microtask 1 executes: log "Micro 1", enqueues Microtask 2
4. Microtask 2 executes: log "Micro 2" (still draining!)
5. Macrotask executes: log "Timeout"

### Key Explanations
- "Microtask enqueued another microtask"
- "Continuing to drain microtask queue"
- "All microtasks complete before macrotask runs"

### Acceptance Criteria
- [ ] Logs: Micro 1, Micro 2, Timeout
- [ ] Microtask 2 executes immediately after Microtask 1
- [ ] Timeout waits for both microtasks
- [ ] Visual shows microtask queue draining

---

## Preset 4: async/await Multiple Awaits

### ID
`async-await-multi`

### Name
"async/await with Multiple Awaits"

### Description
Shows that each `await` creates a microtask for the continuation, demonstrating how async functions break into multiple microtasks.

### Learning Objective
Understand that await yields control and the continuation is scheduled as a microtask.

### Scenario Definition
```javascript
async function foo() {
  console.log('Start');
  await Promise.resolve();
  console.log('After first await');
  await Promise.resolve();
  console.log('After second await');
}

foo();
console.log('Sync end');

// Expected output:
// Start
// Sync end
// After first await
// After second await
```

### Expected Sequence
1. foo() starts: log "Start"
2. First await → yields, continuation enqueued as microtask
3. Sync code: log "Sync end"
4. Microtask (continuation 1): log "After first await"
5. Second await → yields, continuation enqueued as microtask
6. Microtask (continuation 2): log "After second await"

### Key Explanations
- "await yields control, continuation scheduled as microtask"
- "Each await creates a separate microtask"
- "Async function execution is split across multiple microtasks"

### Acceptance Criteria
- [ ] Logs in correct order
- [ ] Two separate microtasks shown (one per await)
- [ ] Explanation mentions "continuation as microtask"

---

## Preset 5: fetch + timers + microtasks

### ID
`fetch-complex`

### Name
"fetch with Timers and Microtasks"

### Description
Complex scenario mixing network request, timers, and microtasks to demonstrate realistic ordering.

### Learning Objective
Understand how different async sources interact and their relative priorities.

### Scenario Definition
```javascript
fetch('/api').then(() => console.log('Fetch'));
setTimeout(() => console.log('Timer'), 10);
Promise.resolve().then(() => console.log('Micro'));
console.log('Sync');

// Expected output:
// Sync
// Micro
// Timer  (ready at 10ms)
// Fetch  (ready at simulated latency, e.g., 50ms)
```

### Expected Sequence
(Depends on fetch latency vs timer delay in scenario config)

### Key Explanations
- "fetch creates Web API operation with network latency"
- "Microtasks execute before any macrotask"
- "Timer and fetch both become ready and enqueue to macrotask queue in order"

### Acceptance Criteria
- [ ] Correct ordering based on timing
- [ ] Microtask executes first
- [ ] Fetch and timer enqueue as macrotasks
- [ ] Timeline shows timing correctly

---

## Preset 6: DOM Event + microtasks + timers

### ID
`dom-event-handlers`

### Name
"DOM Event Handler Scheduling"

### Description
Shows how DOM event handlers are scheduled as macrotasks and can themselves enqueue microtasks and timers.

### Learning Objective
Event handlers follow the same rules: run as macrotask, then drain microtasks.

### Scenario Definition
```javascript
button.addEventListener('click', () => {
  console.log('Click handler');
  Promise.resolve().then(() => console.log('Micro in handler'));
  setTimeout(() => console.log('Timer in handler'), 0);
});

// User clicks button
// Meanwhile, existing microtask
Promise.resolve().then(() => console.log('Existing micro'));

// Expected output:
// Existing micro         (drain existing microtasks first)
// Click handler          (event handler macrotask)
// Micro in handler       (drain microtasks after handler)
// Timer in handler       (next macrotask)
```

### Expected Sequence
1. Click event enqueues event handler as macrotask
2. Existing microtask in queue
3. Drain microtask: log "Existing micro"
4. Execute macrotask (click handler): log "Click handler"
   - Enqueues microtask
   - Enqueues timer
5. Drain microtask: log "Micro in handler"
6. Execute next macrotask (timer): log "Timer in handler"

### Key Explanations
- "Event handlers execute as macrotasks"
- "Microtasks enqueued during handler execute before next macrotask"

### Acceptance Criteria
- [ ] Event handler runs as macrotask
- [ ] Microtasks from handler execute before next macrotask
- [ ] Correct log order

---

## Preset 7: rAF + microtasks + timers

### ID
`raf-timing`

### Name
"requestAnimationFrame Timing"

### Description
Demonstrates when rAF callbacks run relative to microtasks, macrotasks, and rendering.

### Learning Objective
rAF callbacks run in the frame phase, before paint, after microtasks drain.

### Scenario Definition
```javascript
requestAnimationFrame(() => console.log('rAF'));
setTimeout(() => console.log('Timer'), 0);
Promise.resolve().then(() => console.log('Micro'));

// Expected output (at frame boundary):
// Micro
// Timer
// (frame boundary)
// rAF
// (render)
```

### Expected Sequence
1. rAF registers for next frame
2. Timer enqueues as macrotask (ready immediately)
3. Microtask enqueues
4. Drain microtask: log "Micro"
5. Execute macrotask: log "Timer"
6. Frame boundary reached
7. Execute rAF callback: log "rAF"
8. Render step

### Key Explanations
- "rAF callbacks run during frame phase"
- "rAF runs after task queue processes but before render"

### Acceptance Criteria
- [ ] rAF runs at frame boundary
- [ ] Timeline shows frame marker
- [ ] Render step occurs after rAF

---

## Preset 8: Microtask Starvation

### ID
`microtask-starvation`

### Name
"Microtask Starvation (Render Delay)"

### Description
Demonstrates how an infinite or long microtask chain can delay rendering because microtasks are drained before rendering can occur.

### Learning Objective
Excessive microtasks can starve rendering, causing UI freezes.

### Scenario Definition
```javascript
function enqueueMicrotasks(count) {
  if (count > 0) {
    Promise.resolve().then(() => {
      console.log(`Micro ${10 - count + 1}`);
      enqueueMicrotasks(count - 1);
    });
  }
}

enqueueMicrotasks(10);
document.body.style.color = 'red'; // Invalidates render

// Expected: 10 microtasks execute, THEN render happens
```

### Expected Sequence
1. Render invalidated
2. 10 microtasks execute sequentially
3. Microtask queue finally empty
4. Render step occurs

### Key Explanations
- "Render cannot occur while microtasks are executing"
- "Microtask chain is delaying render"
- "This is why excessive microtasks can freeze the UI"

### Acceptance Criteria
- [ ] All 10 microtasks execute before render
- [ ] Render step happens after microtask queue empties
- [ ] Explanation warns about starvation
- [ ] Visual shows delayed render marker

---

## Additional Presets (Optional)

### Preset 9: setInterval
Demonstrates recurring macrotasks

### Preset 10: Error Handling
Shows how errors in different task types are handled

### Preset 11: Task Cancellation
Demonstrates clearTimeout/clearInterval

---

## Implementation Notes

### Scenario JSON Format
Each preset should export a `Scenario` object:

```typescript
export const syncVsSetTimeout: Scenario = {
  id: 'sync-vs-settimeout',
  name: 'Synchronous vs setTimeout(0)',
  description: '...',
  learningObjective: '...',
  tasks: [...],
  tags: ['basics', 'macrotask', 'timer']
};
```

### Explanation Text
Store explanation templates in a separate file, keyed by rule:

```typescript
export const explanations = {
  microtaskDrain: 'Microtasks are drained completely before moving to the next macrotask.',
  timerEnqueue: 'setTimeout creates a Web API operation that enqueues a macrotask when the delay elapses.',
  // ...
};
```

### Testing Each Preset
For each preset:
1. Load scenario
2. Run simulation to completion
3. Assert log output matches expected
4. Assert final step count is deterministic
5. Assert key explanations appeared

### User Experience
When a preset is loaded:
1. Show description + learning objective
2. Reset simulator
3. Load tasks
4. User can then play/step through
5. Explanation panel updates at each step
