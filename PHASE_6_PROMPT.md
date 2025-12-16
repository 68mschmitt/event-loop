# Phase 6 Implementation Prompt - Scenario System

Implement a comprehensive scenario system that allows users to load, create, and explore preset educational examples of event loop behavior.

## Overview

Phase 6 adds a **scenario management system** that transforms the visualizer into an educational tool with curated examples. Users can select from 8+ preset scenarios that demonstrate key event loop concepts, or build custom scenarios using a visual builder interface.

## Prerequisites

- ✅ Phase 5 complete (Playback controls and timeline)
- ✅ State management with scenario loading (Phase 2)
- ✅ UI components and layout (Phase 3)
- ✅ Understanding of event loop patterns and educational goals

## Session Breakdown (12-16 hours total)

### **Session 6.1: Schema & Validation (3-4 hours)**
Build the foundation for defining and validating scenarios:
- Create TypeScript schema for scenario definitions
- Implement Zod validation for runtime safety
- Design scenario metadata structure (title, description, difficulty, tags)
- Build scenario parser that converts JSON to simulator tasks
- Create scenario validator with helpful error messages
- Add scenario versioning support
- Write unit tests for schema validation

**Key files:**
- `src/core/types/scenario.ts` - Already exists, extend as needed
- `src/scenarios/schema.ts` - Zod validation schemas
- `src/scenarios/parser.ts` - JSON to simulator state parser
- `src/scenarios/validator.ts` - Validation logic
- `tests/unit/scenarios/` - Validation tests

**Schema structure:**
```typescript
interface ScenarioDefinition {
  id: string;
  version: '1.0';
  metadata: {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    learningObjectives: string[];
    estimatedDuration: number; // seconds
  };
  tasks: ScenarioTask[];
  config?: {
    frameInterval?: number;
    autoPlay?: boolean;
    playbackSpeed?: number;
  };
}

interface ScenarioTask {
  id: string;
  type: 'macro' | 'micro' | 'raf' | 'webapi';
  label: string;
  duration?: number;
  delay?: number;
  spawns?: ScenarioTask[]; // Tasks spawned when this task runs
}
```

### **Session 6.2: Scenario Builder UI (4-5 hours)**
Create visual interface for building custom scenarios:
- Design `ScenarioBuilder` component with drag-and-drop task creation
- Implement task configuration panel (type, label, duration, spawns)
- Add visual task tree showing parent-child relationships
- Build preview mode that shows scenario before running
- Implement export/import functionality (JSON download/upload)
- Add validation feedback with inline error messages
- Create "Clone & Edit" feature for preset scenarios
- Add undo/redo for scenario editing

**Key files:**
- `src/components/panels/ScenarioBuilder.tsx` - Main builder UI
- `src/components/scenarios/TaskEditor.tsx` - Individual task editor
- `src/components/scenarios/TaskTree.tsx` - Visual task hierarchy
- `src/components/scenarios/ScenarioPreview.tsx` - Preview panel
- `src/hooks/useScenarioBuilder.ts` - Builder state management

**Builder features:**
```typescript
interface ScenarioBuilderState {
  tasks: ScenarioTask[];
  selectedTaskId: string | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  history: ScenarioTask[][]; // For undo/redo
  historyIndex: number;
}
```

### **Session 6.3: Preset Scenarios 1-4 (3-4 hours)**
Implement first four educational preset scenarios:

**1. Basic Macro Task (Beginner)**
- Single setTimeout demonstrating macro queue
- Learning objective: Understand macro task execution
- Expected behavior: Task goes to macro queue, executes after stack clears

**2. Microtask Priority (Beginner)**
- setTimeout vs Promise.resolve()
- Learning objective: Microtasks run before macro tasks
- Expected behavior: Microtask executes first despite being queued second

**3. Promise Chain (Intermediate)**
- Chained promises creating multiple microtasks
- Learning objective: Promise resolution creates microtasks
- Expected behavior: Microtask chain executes before next macro task

**4. Render Timing (Intermediate)**
- Tasks interleaved with requestAnimationFrame
- Learning objective: Renders happen between tasks
- Expected behavior: RAF executes at frame boundary

**Key files:**
- `src/scenarios/presets/01-basic-macro.ts`
- `src/scenarios/presets/02-microtask-priority.ts`
- `src/scenarios/presets/03-promise-chain.ts`
- `src/scenarios/presets/04-render-timing.ts`
- `src/scenarios/presets/index.ts` - Barrel export

### **Session 6.4: Preset Scenarios 5-8 (3-4 hours)**
Implement advanced preset scenarios:

**5. Nested Timers (Intermediate)**
- setTimeout inside setTimeout
- Learning objective: Task spawning creates new macro tasks
- Expected behavior: Nested tasks enqueue during parent execution

**6. Mixed Queue Complexity (Advanced)**
- Combination of macro, micro, and RAF tasks
- Learning objective: Queue priority and execution order
- Expected behavior: Complex interleaving demonstrating all queue types

**7. Event Loop Starvation (Advanced)**
- Long-running synchronous task blocking rendering
- Learning objective: Stack blocking prevents other work
- Expected behavior: UI freeze demonstration

**8. Task Batching (Advanced)**
- Multiple microtasks batched together
- Learning objective: Microtask checkpoint after each macro task
- Expected behavior: All microtasks drain before next macro task

**Key files:**
- `src/scenarios/presets/05-nested-timers.ts`
- `src/scenarios/presets/06-mixed-queues.ts`
- `src/scenarios/presets/07-event-loop-starvation.ts`
- `src/scenarios/presets/08-task-batching.ts`

## Key Concepts

**Scenario Loading Flow:**
```typescript
// 1. Parse scenario JSON
const parsed = parseScenario(scenarioJson);

// 2. Validate structure
const validated = validateScenario(parsed);

// 3. Convert to simulator state
const initialState = scenarioToSimulatorState(validated);

// 4. Load into simulator
dispatch({ type: 'LOAD_SCENARIO', payload: { state: initialState } });
```

**Task Spawning Pattern:**
```typescript
// When a task executes, it can spawn new tasks
const task = {
  id: 'parent-task',
  type: 'macro',
  label: 'Parent setTimeout',
  duration: 1,
  spawns: [
    {
      id: 'child-task',
      type: 'micro',
      label: 'Child Promise',
      duration: 1,
    }
  ]
};
```

**Scenario Presets Panel:**
```typescript
interface PresetCardProps {
  scenario: ScenarioDefinition;
  onLoad: (scenario: ScenarioDefinition) => void;
  onClone?: (scenario: ScenarioDefinition) => void;
}

// Display preset with:
// - Title and description
// - Difficulty badge
// - Estimated duration
// - Tags (e.g., "promises", "rendering", "queues")
// - "Load" and "Clone & Edit" buttons
```

## Success Criteria

Phase 6 is complete when:
- ✅ Scenario schema defined with TypeScript types
- ✅ Zod validation catches malformed scenarios
- ✅ All 8 preset scenarios load and execute correctly
- ✅ Scenario builder allows creating custom scenarios
- ✅ Export/import functionality works (JSON download/upload)
- ✅ Clone & edit feature works for presets
- ✅ Validation errors display helpful messages
- ✅ PresetsPanel displays all scenarios with metadata
- ✅ Scenario descriptions include learning objectives
- ✅ Tags and difficulty filters work
- ✅ TypeScript compiles without errors
- ✅ All existing tests still pass
- ✅ New scenario validation tests pass

## Common Pitfalls to Avoid

❌ **Scenarios with circular task spawning**
✅ **Validate task trees for cycles** before allowing execution

❌ **Invalid task IDs causing state corruption**
✅ **Generate unique IDs** and validate references

❌ **Preset scenarios that never complete**
✅ **Test each scenario** to ensure it reaches a terminal state

❌ **Poor error messages for validation failures**
✅ **Provide context-rich errors** pointing to specific issues

❌ **Scenario builder with no validation feedback**
✅ **Show inline validation errors** as user builds

## Implementation Tips

### Scenario Parser
```typescript
export function scenarioToSimulatorState(
  scenario: ScenarioDefinition
): SimulatorState {
  const state = createInitialState();
  
  // Apply config
  if (scenario.config?.frameInterval) {
    state.frameInterval = scenario.config.frameInterval;
  }
  
  // Enqueue initial tasks
  scenario.tasks.forEach(task => {
    const simulatorTask = convertScenarioTask(task);
    
    switch (task.type) {
      case 'macro':
        state.macroQueue.push(simulatorTask);
        break;
      case 'micro':
        state.microQueue.push(simulatorTask);
        break;
      case 'raf':
        state.rafQueue.push(simulatorTask);
        break;
      // Handle webapi tasks
    }
  });
  
  return state;
}
```

### Validation with Zod
```typescript
import { z } from 'zod';

const ScenarioTaskSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['macro', 'micro', 'raf', 'webapi']),
  label: z.string().min(1),
  duration: z.number().int().positive().optional(),
  delay: z.number().int().nonnegative().optional(),
  spawns: z.lazy(() => z.array(ScenarioTaskSchema)).optional(),
});

const ScenarioSchema = z.object({
  id: z.string().min(1),
  version: z.literal('1.0'),
  metadata: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    learningObjectives: z.array(z.string()),
    estimatedDuration: z.number().positive(),
  }),
  tasks: z.array(ScenarioTaskSchema),
  config: z.object({
    frameInterval: z.number().positive().optional(),
    autoPlay: z.boolean().optional(),
    playbackSpeed: z.number().positive().optional(),
  }).optional(),
});

export function validateScenario(data: unknown): ScenarioDefinition {
  return ScenarioSchema.parse(data);
}
```

### Preset Scenario Example
```typescript
// src/scenarios/presets/02-microtask-priority.ts
import type { ScenarioDefinition } from '@/core/types/scenario';

export const microtaskPriorityScenario: ScenarioDefinition = {
  id: 'microtask-priority',
  version: '1.0',
  metadata: {
    title: 'Microtask Priority',
    description: 'Demonstrates that microtasks always execute before the next macro task, even if the macro task was queued first.',
    difficulty: 'beginner',
    tags: ['microtasks', 'promises', 'priority'],
    learningObjectives: [
      'Understand microtask queue priority',
      'See how Promise.resolve() creates microtasks',
      'Learn the execution order: stack → microtasks → macro task',
    ],
    estimatedDuration: 15, // seconds
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout (queued first)',
      duration: 1,
    },
    {
      id: 'micro-1',
      type: 'micro',
      label: 'Promise.resolve() (queued second)',
      duration: 1,
    },
  ],
  config: {
    autoPlay: true,
    playbackSpeed: 0.5, // Slow for learning
  },
};
```

### Scenario Builder State Management
```typescript
export function useScenarioBuilder() {
  const [state, setState] = useState<ScenarioBuilderState>({
    tasks: [],
    selectedTaskId: null,
    validationErrors: [],
    isDirty: false,
    history: [[]],
    historyIndex: 0,
  });
  
  const addTask = useCallback((task: ScenarioTask) => {
    setState(prev => {
      const newTasks = [...prev.tasks, task];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newTasks);
      
      return {
        ...prev,
        tasks: newTasks,
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);
  
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex === 0) return prev;
      return {
        ...prev,
        tasks: prev.history[prev.historyIndex - 1],
        historyIndex: prev.historyIndex - 1,
      };
    });
  }, []);
  
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      return {
        ...prev,
        tasks: prev.history[prev.historyIndex + 1],
        historyIndex: prev.historyIndex + 1,
      };
    });
  }, []);
  
  const exportScenario = useCallback(() => {
    const scenario = buildScenarioFromState(state);
    const json = JSON.stringify(scenario, null, 2);
    downloadFile('scenario.json', json);
  }, [state]);
  
  return {
    ...state,
    addTask,
    removeTask,
    updateTask,
    undo,
    redo,
    exportScenario,
    importScenario,
  };
}
```

## Integration with Existing Code

### Update PresetsPanel
```typescript
// src/components/panels/PresetsPanel.tsx
import { PRESET_SCENARIOS } from '@/scenarios/presets';
import { useLoadScenario } from '@/state/hooks/useLoadScenario';

export function PresetsPanel() {
  const loadScenario = useLoadScenario();
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  const filteredScenarios = PRESET_SCENARIOS.filter(
    s => filter === 'all' || s.metadata.difficulty === filter
  );
  
  return (
    <div className="p-6">
      <h2>Preset Scenarios</h2>
      
      {/* Difficulty filters */}
      <div className="flex gap-2 mb-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        <FilterButton active={filter === 'beginner'} onClick={() => setFilter('beginner')}>
          Beginner
        </FilterButton>
        {/* ... other filters */}
      </div>
      
      {/* Scenario cards */}
      <div className="grid gap-4">
        {filteredScenarios.map(scenario => (
          <PresetCard
            key={scenario.id}
            scenario={scenario}
            onLoad={() => loadScenario(scenario)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Extend useLoadScenario Hook
The hook already exists from Phase 2. Extend it to:
- Accept ScenarioDefinition instead of raw state
- Parse scenario into simulator state
- Validate before loading
- Handle errors gracefully

## Polishing Phase

### After Implementation - Use Context7 MCP for Best Practices

Once you've completed all four sessions and have working scenarios, **use the Context7 MCP tool** to verify your implementation follows best practices:

1. **Get Zod documentation:**
   ```typescript
   // Use context7_resolve-library-id to find Zod
   context7_resolve-library-id({ libraryName: "zod" })
   
   // Then get docs on schema validation
   context7_get-library-docs({ 
     context7CompatibleLibraryID: "/colinhacks/zod",
     topic: "schema validation parse error handling",
     mode: "code"
   })
   ```

2. **Get React Hook Form documentation (if using forms):**
   ```typescript
   context7_resolve-library-id({ libraryName: "react-hook-form" })
   
   context7_get-library-docs({
     context7CompatibleLibraryID: "/react-hook-form/react-hook-form",
     topic: "form validation integration",
     mode: "code"
   })
   ```

3. **Review your code against docs:**
   - Check if Zod schemas are properly typed
   - Verify error handling follows Zod best practices
   - Ensure form validation (if used) integrates correctly
   - Confirm scenario parsing handles edge cases
   - Check that JSON import/export is secure

4. **Common things to verify:**
   - Are Zod errors transformed into user-friendly messages?
   - Is scenario validation happening at the right boundaries?
   - Are circular dependencies in task spawning prevented?
   - Is the scenario builder state management optimal?
   - Are file uploads sanitized and validated?

5. **Get TypeScript documentation for advanced types:**
   ```typescript
   context7_resolve-library-id({ libraryName: "typescript" })
   
   context7_get-library-docs({
     context7CompatibleLibraryID: "/microsoft/TypeScript",
     topic: "recursive types discriminated unions",
     mode: "code"
   })
   ```

This verification step ensures your scenario system is production-ready, follows framework conventions, and handles edge cases properly.

## Testing Checklist

Manual testing to perform:
- [ ] Load each of the 8 preset scenarios
- [ ] Verify each preset executes as described
- [ ] Test scenario builder: add, edit, delete tasks
- [ ] Test undo/redo in scenario builder
- [ ] Export scenario to JSON
- [ ] Import scenario from JSON file
- [ ] Clone preset and modify it
- [ ] Test validation: try to load malformed scenario
- [ ] Verify helpful error messages for invalid scenarios
- [ ] Test with circular task spawning (should reject)
- [ ] Filter presets by difficulty
- [ ] Filter presets by tags
- [ ] Test autoPlay config option
- [ ] Test playbackSpeed config option
- [ ] Verify learning objectives displayed correctly
- [ ] Test scenario builder on mobile (responsive)

Automated tests to write:
- [ ] Unit tests for scenario schema validation
- [ ] Unit tests for scenario parser
- [ ] Unit tests for task tree validation (cycle detection)
- [ ] Integration tests for loading scenarios
- [ ] Tests for each preset scenario

## Next Steps After Phase 6

Once scenarios are complete:
1. **User test** with actual learners to validate educational value
2. **Create video tutorials** for each preset scenario
3. **Add community scenario sharing** (optional: cloud storage)
4. **Proceed to Phase 7** (Accessibility & Polish)
5. **Optional enhancements:**
   - Scenario difficulty rating system
   - Progress tracking (which scenarios completed)
   - Scenario search and filtering
   - Scenario categories/collections

## Resources

- **Zod Documentation:** Schema validation and type inference
- **Event Loop Fundamentals:** MDN Web Docs on event loop
- **Educational Design:** Ensuring scenarios teach effectively
- **JSON Schema:** For documentation and external tooling support

---

**Estimated Total Time:** 12-16 hours
**Complexity:** Medium-High (validation, parsing, educational design)
**Dependencies:** Phase 2 (scenario loading), Phase 3 (UI panels), Phase 5 (playback)

**Key Deliverable:** A complete library of educational scenarios that help users understand event loop behavior through interactive exploration.
