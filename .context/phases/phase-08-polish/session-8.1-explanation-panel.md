# Session 8.1: Explanation Panel with Rule Descriptions

## Overview

This session builds an **explanation panel** that provides step-by-step descriptions of what's happening in the simulation. The panel references specific event loop rules, explains priority decisions, and helps users understand why tasks execute in a particular order.

## Prerequisites

- Phase 3 completed (panel structure exists)
- Phase 5 completed (playback controls work)
- Understanding of event loop priority rules (see `reference/event-loop-rules.md`)
- SimulatorState includes log entries

## Goals

- [ ] Create ExplanationPanel component
- [ ] Build explanation text database
- [ ] Implement rule reference system
- [ ] Generate step-by-step explanations
- [ ] Display "why this happened" for each action
- [ ] Support basic and detailed explanation modes
- [ ] Show relevant task information
- [ ] Link explanations to rule documentation

## Files to Create/Modify

### `src/components/panels/ExplanationPanel/ExplanationPanel.tsx`
**Purpose:** Main explanation panel container
**Exports:** `ExplanationPanel`
**Key responsibilities:**
- Display current step explanation
- Toggle between basic and detailed modes
- Show related tasks
- Provide rule references

### `src/components/panels/ExplanationPanel/RuleReference.tsx`
**Purpose:** Display individual rule reference
**Exports:** `RuleReference`
**Key responsibilities:**
- Show rule number and title
- Display rule description
- Link to full documentation
- Highlight when rule applies

### `src/components/panels/ExplanationPanel/StepExplanation.tsx`
**Purpose:** Explanation for current simulation step
**Exports:** `StepExplanation`
**Key responsibilities:**
- Generate explanation from state
- Format with task names
- Show before/after comparison
- Indicate priority decision

### `src/components/panels/ExplanationPanel/explanationText.ts`
**Purpose:** Database of explanation templates
**Exports:** `getExplanation`, `formatExplanation`, `getRuleText`
**Key responsibilities:**
- Store explanation templates
- Interpolate variables
- Map actions to explanations
- Provide rule descriptions

### `src/hooks/useExplanation.ts`
**Purpose:** Hook to generate explanations
**Exports:** `useExplanation`
**Key responsibilities:**
- Analyze state changes
- Determine which rule applied
- Build explanation object
- Track explanation history

## Type Definitions

```typescript
/**
 * Explanation for a single simulation step.
 */
export interface StepExplanation {
  stepIndex: number;
  rule: EventLoopRule;
  summary: string;           // One-sentence summary
  details: string;           // Detailed explanation
  reasoning: string;         // Why this rule applied
  involvedTasks: string[];   // Task IDs involved
  stateChanges: StateChange[];
}

/**
 * Event loop rule reference.
 */
export interface EventLoopRule {
  number: number;            // Rule number (1-7)
  name: string;              // e.g., "Complete Current Call Stack Frame"
  description: string;       // Full rule description
  condition: string;         // When this rule applies
  action: string;            // What happens
  effect: string;            // Result of applying rule
}

/**
 * State change description.
 */
export interface StateChange {
  type: 'enqueue' | 'dequeue' | 'push' | 'pop' | 'update' | 'render' | 'time-advance';
  location: 'callstack' | 'macro' | 'micro' | 'raf' | 'webapi';
  taskId?: string;
  details: string;
}

/**
 * Explanation mode.
 */
export type ExplanationMode = 'basic' | 'detailed' | 'expert';

/**
 * Props for ExplanationPanel.
 */
export interface ExplanationPanelProps {
  mode?: ExplanationMode;
  onModeChange?: (mode: ExplanationMode) => void;
  showRuleReferences?: boolean;
}
```

## Implementation Specifications

### Explanation Text Database

Create a comprehensive database of explanation templates:

```typescript
// src/components/panels/ExplanationPanel/explanationText.ts

/**
 * Rule descriptions matching event-loop-rules.md
 */
export const RULES: Record<number, EventLoopRule> = {
  1: {
    number: 1,
    name: "Complete Current Call Stack Frame",
    description: "When a task is running, it must complete before anything else happens.",
    condition: "Call stack is non-empty AND top frame has remaining steps",
    action: "Execute one step of the current frame, decrement stepsRemaining",
    effect: "Task continues running (or completes if stepsRemaining reaches 0)"
  },
  2: {
    number: 2,
    name: "Drain Microtask Queue",
    description: "Microtasks run to completion before any macrotasks or rendering.",
    condition: "Call stack is empty AND microtask queue is non-empty",
    action: "Dequeue one microtask, push to call stack",
    effect: "Microtask begins executing"
  },
  3: {
    number: 3,
    name: "Check for Render",
    description: "Browser checks if it's time to render the page.",
    condition: "All queues empty AND renderPending is true AND enough time passed",
    action: "Execute render step",
    effect: "Page updates visually, renderPending set to false"
  },
  4: {
    number: 4,
    name: "Execute rAF Callback",
    description: "requestAnimationFrame callbacks run before paint.",
    condition: "Call stack empty AND microtasks empty AND render occurred AND rAF queue non-empty",
    action: "Dequeue one rAF callback, push to call stack",
    effect: "rAF callback begins executing"
  },
  5: {
    number: 5,
    name: "Execute Macrotask",
    description: "Regular tasks (timers, events) run one at a time.",
    condition: "Call stack empty AND microtasks empty AND macrotask queue non-empty",
    action: "Dequeue one macrotask, push to call stack",
    effect: "Macrotask begins executing"
  },
  6: {
    number: 6,
    name: "Advance Time",
    description: "When nothing is ready, jump forward to the next event.",
    condition: "All queues empty AND Web APIs have pending operations",
    action: "Set time to earliest readyAt, enqueue ready operations",
    effect: "Time advances to next event"
  },
  7: {
    number: 7,
    name: "Simulation Complete",
    description: "All work is done, simulation ends.",
    condition: "All queues empty AND no Web API operations pending",
    action: "Mark simulation as complete",
    effect: "No more ticks possible"
  }
};

/**
 * Explanation templates by rule number.
 */
export const EXPLANATIONS: Record<number, ExplanationTemplate> = {
  1: {
    basic: "Continuing to execute {{taskLabel}}...",
    detailed: "The call stack has {{taskLabel}} running with {{stepsRemaining}} steps remaining. We must let it complete its current step before doing anything else.",
    reasoning: "Rule 1 has highest priority: tasks that start must finish uninterrupted."
  },
  2: {
    basic: "Running microtask {{taskLabel}} from the microtask queue.",
    detailed: "The call stack is now empty. Rule 2 says we must check the microtask queue next. Found {{taskLabel}}, moving it to the call stack to execute.",
    reasoning: "Microtasks always run before macrotasks. This ensures promises resolve as quickly as possible."
  },
  3: {
    basic: "Rendering the page (style, layout, paint).",
    detailed: "All JavaScript execution is paused. The browser needs to render because renderPending was set to true and {{frameInterval}}ms have passed since the last frame.",
    reasoning: "The browser must update the visual display at regular intervals (typically 60fps)."
  },
  4: {
    basic: "Running requestAnimationFrame callback {{taskLabel}}.",
    detailed: "A render opportunity just occurred. Before painting, we run any rAF callbacks. Found {{taskLabel}} in the rAF queue.",
    reasoning: "rAF callbacks run in the frame phase to allow animations to update just before paint."
  },
  5: {
    basic: "Running macrotask {{taskLabel}} from the macrotask queue.",
    detailed: "The call stack is empty and microtask queue is empty. Time to process the next macrotask. Dequeuing {{taskLabel}}.",
    reasoning: "Macrotasks run one per tick after all microtasks are drained."
  },
  6: {
    basic: "Advancing time from {{fromTime}}ms to {{toTime}}ms.",
    detailed: "Nothing is ready to execute right now. Jumping ahead to {{toTime}}ms when {{taskLabel}} will be ready.",
    reasoning: "When all queues are empty, we fast-forward to the next scheduled event."
  },
  7: {
    basic: "Simulation complete - no more work to do!",
    detailed: "All queues are empty and no Web API operations are pending. The event loop has nothing left to process.",
    reasoning: "The simulation ends when there's no more work scheduled."
  }
};

/**
 * Generate explanation for a step.
 */
export function generateExplanation(
  prevState: SimulatorState,
  nextState: SimulatorState,
  mode: ExplanationMode
): StepExplanation {
  const rule = determineRule(prevState, nextState);
  const template = EXPLANATIONS[rule.number];
  
  const variables = extractVariables(prevState, nextState);
  
  return {
    stepIndex: nextState.stepIndex,
    rule,
    summary: interpolate(template.basic, variables),
    details: interpolate(template.detailed, variables),
    reasoning: interpolate(template.reasoning, variables),
    involvedTasks: extractInvolvedTasks(prevState, nextState),
    stateChanges: detectStateChanges(prevState, nextState)
  };
}

/**
 * Determine which rule was applied.
 */
function determineRule(
  prev: SimulatorState,
  next: SimulatorState
): EventLoopRule {
  // Call stack was running and continued
  if (prev.callStack.length > 0 && next.callStack.length > 0) {
    const prevFrame = prev.callStack[prev.callStack.length - 1];
    const nextFrame = next.callStack[next.callStack.length - 1];
    
    if (prevFrame.task.id === nextFrame.task.id && 
        nextFrame.stepsRemaining < prevFrame.stepsRemaining) {
      return RULES[1];
    }
  }
  
  // Microtask was dequeued
  if (prev.callStack.length === 0 && 
      next.callStack.length > 0 &&
      prev.microQueue.length > next.microQueue.length) {
    return RULES[2];
  }
  
  // Render occurred
  if (prev.renderPending && !next.renderPending) {
    return RULES[3];
  }
  
  // rAF callback dequeued
  if (prev.rafQueue.length > next.rafQueue.length &&
      next.callStack.length > 0) {
    return RULES[4];
  }
  
  // Macrotask dequeued
  if (prev.macroQueue.length > next.macroQueue.length &&
      next.callStack.length > 0) {
    return RULES[5];
  }
  
  // Time advanced
  if (next.now > prev.now && 
      prev.callStack.length === 0 &&
      prev.microQueue.length === 0 &&
      prev.macroQueue.length === 0) {
    return RULES[6];
  }
  
  // Simulation complete
  if (isSimulationComplete(next)) {
    return RULES[7];
  }
  
  // Fallback
  return RULES[1];
}

/**
 * Extract variables for template interpolation.
 */
function extractVariables(
  prev: SimulatorState,
  next: SimulatorState
): Record<string, any> {
  const variables: Record<string, any> = {
    fromTime: prev.now,
    toTime: next.now,
    frameInterval: next.frameInterval
  };
  
  // Add task labels
  if (next.callStack.length > 0) {
    const currentTask = next.callStack[next.callStack.length - 1].task;
    variables.taskLabel = currentTask.label;
    variables.stepsRemaining = next.callStack[next.callStack.length - 1].stepsRemaining;
  }
  
  return variables;
}

/**
 * Interpolate template with variables.
 */
function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}
```

### ExplanationPanel Component

```typescript
// src/components/panels/ExplanationPanel/ExplanationPanel.tsx

export function ExplanationPanel({
  mode = 'basic',
  onModeChange,
  showRuleReferences = true
}: ExplanationPanelProps) {
  const { state, history } = useSimulator();
  const explanation = useExplanation(state, history);
  
  if (!explanation) {
    return (
      <div className="p-4 text-gray-500">
        Run the simulation to see explanations
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold">Explanation</h3>
        <select
          value={mode}
          onChange={(e) => onModeChange?.(e.target.value as ExplanationMode)}
          className="text-sm border rounded px-2 py-1"
          aria-label="Explanation detail level"
        >
          <option value="basic">Basic</option>
          <option value="detailed">Detailed</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      
      {/* Current step explanation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <StepExplanation
          explanation={explanation}
          mode={mode}
        />
        
        {showRuleReferences && (
          <RuleReference rule={explanation.rule} />
        )}
        
        {mode !== 'basic' && (
          <StateChanges changes={explanation.stateChanges} />
        )}
      </div>
    </div>
  );
}
```

### useExplanation Hook

```typescript
// src/hooks/useExplanation.ts

export function useExplanation(
  state: SimulatorState,
  history: SimulationSnapshot[]
): StepExplanation | null {
  return useMemo(() => {
    if (history.length < 2) return null;
    
    const currentIndex = state.stepIndex;
    const prevSnapshot = history[currentIndex - 1];
    const currentSnapshot = history[currentIndex];
    
    if (!prevSnapshot || !currentSnapshot) return null;
    
    return generateExplanation(
      prevSnapshot.state,
      currentSnapshot.state,
      'basic'
    );
  }, [state.stepIndex, history]);
}
```

## Example Explanation Text

### Rule 1: Call Stack Execution
**Basic:** "Continuing to execute 'setTimeout callback'..."
**Detailed:** "The call stack has 'setTimeout callback' running with 2 steps remaining. We must let it complete its current step before doing anything else."
**Reasoning:** "Rule 1 has highest priority: tasks that start must finish uninterrupted."

### Rule 2: Microtask
**Basic:** "Running microtask 'Promise.then' from the microtask queue."
**Detailed:** "The call stack is now empty. Rule 2 says we must check the microtask queue next. Found 'Promise.then', moving it to the call stack to execute."
**Reasoning:** "Microtasks always run before macrotasks. This ensures promises resolve as quickly as possible."

### Rule 5: Macrotask
**Basic:** "Running macrotask 'setTimeout callback' from the macrotask queue."
**Detailed:** "The call stack is empty and microtask queue is empty. Time to process the next macrotask. Dequeuing 'setTimeout callback'."
**Reasoning:** "Macrotasks run one per tick after all microtasks are drained."

### Rule 6: Time Advance
**Basic:** "Advancing time from 0ms to 100ms."
**Detailed:** "Nothing is ready to execute right now. Jumping ahead to 100ms when 'setTimeout(100)' will be ready."
**Reasoning:** "When all queues are empty, we fast-forward to the next scheduled event."

## Success Criteria

- [ ] Explanation panel displays for each step
- [ ] All 7 rules have explanation text
- [ ] Variables interpolate correctly (task names, times)
- [ ] Basic mode is beginner-friendly
- [ ] Detailed mode references rules
- [ ] Expert mode shows state changes
- [ ] Rule references link to documentation
- [ ] Explanations update on step forward/back
- [ ] Can toggle between explanation modes
- [ ] Involved tasks are highlighted
- [ ] Clear, grammatically correct language

## Test Specifications

### Test: Generate explanation for Rule 2 (microtask)
**Given:** Previous state with empty call stack and microtask in queue
**When:** generateExplanation() is called
**Then:** Returns explanation with rule 2, mentions microtask queue

```typescript
test('generates microtask explanation', () => {
  const prev: SimulatorState = {
    callStack: [],
    microQueue: [createMicrotask('Promise.then')],
    // ...
  };
  
  const next: SimulatorState = {
    callStack: [{ task: microTask, stepsRemaining: 1 }],
    microQueue: [],
    // ...
  };
  
  const explanation = generateExplanation(prev, next, 'basic');
  
  expect(explanation.rule.number).toBe(2);
  expect(explanation.summary).toContain('microtask');
  expect(explanation.summary).toContain('Promise.then');
});
```

### Test: Interpolate variables in template
**Given:** Template with {{taskLabel}} placeholder
**When:** interpolate() is called with { taskLabel: 'Timer' }
**Then:** Returns string with "Timer" substituted

```typescript
test('interpolates task label', () => {
  const template = "Running {{taskLabel}}...";
  const variables = { taskLabel: 'Timer Callback' };
  
  const result = interpolate(template, variables);
  
  expect(result).toBe('Running Timer Callback...');
});
```

### Test: Determine rule from state changes
**Given:** Previous and next states showing time advance
**When:** determineRule() is called
**Then:** Returns Rule 6

```typescript
test('identifies time advance', () => {
  const prev = { now: 0, callStack: [], /* ... */ };
  const next = { now: 100, callStack: [], /* ... */ };
  
  const rule = determineRule(prev, next);
  
  expect(rule.number).toBe(6);
  expect(rule.name).toBe('Advance Time');
});
```

## Integration Points

- **Phase 1**: Uses core simulator state and rules
- **Phase 2**: Reads from history system
- **Phase 3**: Integrates into panel structure
- **Phase 5**: Syncs with playback controls
- **Session 8.2**: Links to task inspector

## References

- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Simulator State](../../architecture/data-flow.md)
- [Panel Structure](../phase-03-ui-scaffolding/session-3.3-panels.md)

## Notes

- Keep explanation text at 8th grade reading level
- Use present tense ("running", not "ran")
- Bold task names for visibility
- Provide "Learn More" links to MDN
- Support localization in future
- Consider adding diagrams for complex rules
