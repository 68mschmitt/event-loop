# Session 6.2: Scenario Builder UI

## Overview

This session builds the UI for creating custom scenarios. The Scenario Builder allows users to add tasks, configure their properties, reorder them, and export/import scenarios as JSON. This empowers users to create their own experiments and test their understanding of the event loop.

## Prerequisites

- Phase 3 complete (UI scaffolding exists)
- Session 6.1 complete (validation available)
- Understanding of React forms and controlled components
- Understanding of drag-and-drop or list reordering

## Goals

- [ ] Create ScenarioBuilder component with task list
- [ ] Implement add/remove task functionality
- [ ] Create task configuration forms for each task type
- [ ] Add task reordering (drag-and-drop or buttons)
- [ ] Implement scenario metadata editor
- [ ] Add export scenario to JSON
- [ ] Add import scenario from JSON/file
- [ ] Show validation errors inline
- [ ] Add clear/reset functionality
- [ ] Make builder responsive

## Files to Create/Modify

### `src/components/panels/ScenarioBuilder.tsx`
**Purpose:** Main scenario builder component
**Exports:** `ScenarioBuilder`
**Key responsibilities:**
- Render list of tasks
- Add/remove tasks
- Show task configuration forms
- Handle reordering
- Export/import controls

### `src/components/panels/ScenarioBuilder/TaskList.tsx`
**Purpose:** List of tasks with reordering
**Exports:** `TaskList`
**Key responsibilities:**
- Render draggable task items
- Handle reorder events
- Show task summary

### `src/components/panels/ScenarioBuilder/TaskForm.tsx`
**Purpose:** Form for editing individual task
**Exports:** `TaskForm`
**Key responsibilities:**
- Type-specific field inputs
- Validation feedback
- Effect editor

### `src/components/panels/ScenarioBuilder/AddTaskMenu.tsx`
**Purpose:** Menu/modal for selecting task type to add
**Exports:** `AddTaskMenu`
**Key responsibilities:**
- Show task type options
- Provide descriptions
- Create default task

### `src/components/panels/ScenarioBuilder/ScenarioMetadataForm.tsx`
**Purpose:** Form for scenario metadata
**Exports:** `ScenarioMetadataForm`
**Key responsibilities:**
- Edit id, name, description
- Edit learning objective
- Edit tags

### `src/components/panels/ScenarioBuilder/ExportImportControls.tsx`
**Purpose:** Controls for export/import
**Exports:** `ExportImportControls`
**Key responsibilities:**
- Export to JSON download
- Import from file upload
- Copy/paste JSON

### `src/state/hooks/useScenarioBuilder.ts`
**Purpose:** Hook for builder state management
**Exports:** `useScenarioBuilder`
**Key responsibilities:**
- Track draft scenario
- Add/remove/update tasks
- Validate on change
- Export/import logic

## Component Structure

### ScenarioBuilder Main Component

```typescript
import { useState } from 'react';
import { Scenario, ScenarioTask, TaskType } from '@/core/types';
import { validateScenario } from '@/core/scenarios/validator';
import { TaskList } from './ScenarioBuilder/TaskList';
import { TaskForm } from './ScenarioBuilder/TaskForm';
import { AddTaskMenu } from './ScenarioBuilder/AddTaskMenu';
import { ScenarioMetadataForm } from './ScenarioBuilder/ScenarioMetadataForm';
import { ExportImportControls } from './ScenarioBuilder/ExportImportControls';

export function ScenarioBuilder() {
  const {
    scenario,
    selectedTaskIndex,
    validationResult,
    addTask,
    removeTask,
    updateTask,
    reorderTasks,
    updateMetadata,
    selectTask,
    exportScenario,
    importScenario,
    clearScenario,
  } = useScenarioBuilder();

  return (
    <div className="scenario-builder">
      {/* Header */}
      <div className="builder-header">
        <h2>Scenario Builder</h2>
        <ExportImportControls
          onExport={exportScenario}
          onImport={importScenario}
          validationResult={validationResult}
        />
      </div>

      {/* Two-column layout */}
      <div className="builder-body">
        {/* Left: Task list */}
        <div className="task-list-panel">
          <TaskList
            tasks={scenario.tasks}
            selectedIndex={selectedTaskIndex}
            onSelect={selectTask}
            onRemove={removeTask}
            onReorder={reorderTasks}
          />
          <AddTaskMenu onAdd={addTask} />
        </div>

        {/* Right: Configuration */}
        <div className="config-panel">
          {selectedTaskIndex === null ? (
            <ScenarioMetadataForm
              metadata={scenario}
              onChange={updateMetadata}
              validationErrors={validationResult.ok ? [] : validationResult.errors}
            />
          ) : (
            <TaskForm
              task={scenario.tasks[selectedTaskIndex]}
              index={selectedTaskIndex}
              onChange={(updated) => updateTask(selectedTaskIndex, updated)}
              validationErrors={validationResult.ok ? [] : validationResult.errors}
            />
          )}
        </div>
      </div>

      {/* Validation feedback */}
      {!validationResult.ok && (
        <div className="validation-summary">
          <h3>Validation Errors ({validationResult.errors.length})</h3>
          <ul>
            {validationResult.errors.map((error, i) => (
              <li key={i} className="error-item">
                <strong>{error.field}:</strong> {error.message}
                {error.suggestion && <div className="suggestion">{error.suggestion}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### useScenarioBuilder Hook

```typescript
import { useState, useCallback, useMemo } from 'react';
import { Scenario, ScenarioTask, TaskType } from '@/core/types';
import { validateScenario, ValidationResult } from '@/core/scenarios/validator';
import { SCENARIO_SCHEMA_VERSION } from '@/core/scenarios/schema';

const DEFAULT_SCENARIO: Scenario = {
  id: 'custom-scenario',
  name: 'Custom Scenario',
  description: 'A custom scenario',
  learningObjective: '',
  tags: ['custom'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [],
};

export function useScenarioBuilder() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  // Validate whenever scenario changes
  const validationResult = useMemo(
    () => validateScenario(scenario),
    [scenario]
  );

  const addTask = useCallback((type: TaskType) => {
    const newTask: ScenarioTask = createDefaultTask(type);
    setScenario(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    setSelectedTaskIndex(scenario.tasks.length); // Select new task
  }, [scenario.tasks.length]);

  const removeTask = useCallback((index: number) => {
    setScenario(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
    if (selectedTaskIndex === index) {
      setSelectedTaskIndex(null);
    } else if (selectedTaskIndex !== null && selectedTaskIndex > index) {
      setSelectedTaskIndex(selectedTaskIndex - 1);
    }
  }, [selectedTaskIndex]);

  const updateTask = useCallback((index: number, updated: ScenarioTask) => {
    setScenario(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? updated : task),
    }));
  }, []);

  const reorderTasks = useCallback((fromIndex: number, toIndex: number) => {
    setScenario(prev => {
      const tasks = [...prev.tasks];
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      return { ...prev, tasks };
    });
  }, []);

  const updateMetadata = useCallback((updates: Partial<Scenario>) => {
    setScenario(prev => ({ ...prev, ...updates }));
  }, []);

  const selectTask = useCallback((index: number | null) => {
    setSelectedTaskIndex(index);
  }, []);

  const exportScenario = useCallback(() => {
    const json = JSON.stringify(scenario, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenario]);

  const importScenario = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const result = validateScenario(parsed);
      if (result.ok) {
        setScenario(result.value);
        setSelectedTaskIndex(null);
        return { success: true };
      } else {
        return { success: false, errors: result.errors };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: '',
          code: 'PARSE_ERROR',
          message: 'Invalid JSON',
          severity: 'error' as const,
        }],
      };
    }
  }, []);

  const clearScenario = useCallback(() => {
    setScenario(DEFAULT_SCENARIO);
    setSelectedTaskIndex(null);
  }, []);

  return {
    scenario,
    selectedTaskIndex,
    validationResult,
    addTask,
    removeTask,
    updateTask,
    reorderTasks,
    updateMetadata,
    selectTask,
    exportScenario,
    importScenario,
    clearScenario,
  };
}

function createDefaultTask(type: TaskType): ScenarioTask {
  switch (type) {
    case TaskType.SYNC:
      return {
        type: TaskType.SYNC,
        label: 'Synchronous task',
        effects: [{ type: 'log', payload: 'Sync' }],
      };
    case TaskType.TIMER:
      return {
        type: TaskType.TIMER,
        label: 'setTimeout callback',
        delay: 0,
        effects: [{ type: 'log', payload: 'Timer' }],
      };
    case TaskType.MICROTASK:
      return {
        type: TaskType.MICROTASK,
        label: 'Promise.then callback',
        effects: [{ type: 'log', payload: 'Microtask' }],
      };
    case TaskType.FETCH:
      return {
        type: TaskType.FETCH,
        label: 'fetch callback',
        url: '/api/data',
        latency: 100,
        effects: [{ type: 'log', payload: 'Fetch complete' }],
      };
    case TaskType.DOM_EVENT:
      return {
        type: TaskType.DOM_EVENT,
        label: 'Event handler',
        eventType: 'click',
        effects: [{ type: 'log', payload: 'Event handled' }],
      };
    case TaskType.RAF:
      return {
        type: TaskType.RAF,
        label: 'requestAnimationFrame callback',
        effects: [{ type: 'log', payload: 'rAF' }],
      };
    default:
      return {
        type: TaskType.SYNC,
        label: 'Task',
        effects: [],
      };
  }
}
```

### TaskForm Component

```typescript
interface TaskFormProps {
  task: ScenarioTask;
  index: number;
  onChange: (updated: ScenarioTask) => void;
  validationErrors: ValidationError[];
}

export function TaskForm({ task, index, onChange, validationErrors }: TaskFormProps) {
  const fieldErrors = useMemo(
    () => validationErrors.filter(e => e.field.startsWith(`tasks[${index}]`)),
    [validationErrors, index]
  );

  const getFieldError = (fieldName: string) => {
    return fieldErrors.find(e => e.field === `tasks[${index}].${fieldName}`);
  };

  return (
    <div className="task-form">
      <h3>Configure Task {index + 1}</h3>

      {/* Task type (read-only once created) */}
      <div className="form-field">
        <label>Type</label>
        <input type="text" value={task.type} disabled />
      </div>

      {/* Label */}
      <div className="form-field">
        <label htmlFor={`task-${index}-label`}>Label</label>
        <input
          id={`task-${index}-label`}
          type="text"
          value={task.label}
          onChange={(e) => onChange({ ...task, label: e.target.value })}
          className={getFieldError('label') ? 'error' : ''}
        />
        {getFieldError('label') && (
          <div className="field-error">{getFieldError('label')!.message}</div>
        )}
      </div>

      {/* Type-specific fields */}
      {task.type === TaskType.TIMER && (
        <div className="form-field">
          <label htmlFor={`task-${index}-delay`}>Delay (ms)</label>
          <input
            id={`task-${index}-delay`}
            type="number"
            min="0"
            value={task.delay ?? 0}
            onChange={(e) => onChange({ ...task, delay: parseInt(e.target.value, 10) })}
            className={getFieldError('delay') ? 'error' : ''}
          />
          {getFieldError('delay') && (
            <div className="field-error">{getFieldError('delay')!.message}</div>
          )}
        </div>
      )}

      {task.type === TaskType.FETCH && (
        <>
          <div className="form-field">
            <label htmlFor={`task-${index}-url`}>URL</label>
            <input
              id={`task-${index}-url`}
              type="text"
              value={task.url ?? ''}
              onChange={(e) => onChange({ ...task, url: e.target.value })}
              className={getFieldError('url') ? 'error' : ''}
            />
            {getFieldError('url') && (
              <div className="field-error">{getFieldError('url')!.message}</div>
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`task-${index}-latency`}>Latency (ms)</label>
            <input
              id={`task-${index}-latency`}
              type="number"
              min="0"
              value={task.latency ?? 0}
              onChange={(e) => onChange({ ...task, latency: parseInt(e.target.value, 10) })}
              className={getFieldError('latency') ? 'error' : ''}
            />
            {getFieldError('latency') && (
              <div className="field-error">{getFieldError('latency')!.message}</div>
            )}
          </div>
        </>
      )}

      {task.type === TaskType.DOM_EVENT && (
        <div className="form-field">
          <label htmlFor={`task-${index}-eventType`}>Event Type</label>
          <input
            id={`task-${index}-eventType`}
            type="text"
            value={task.eventType ?? ''}
            onChange={(e) => onChange({ ...task, eventType: e.target.value })}
            placeholder="e.g., click, input, keydown"
            className={getFieldError('eventType') ? 'error' : ''}
          />
          {getFieldError('eventType') && (
            <div className="field-error">{getFieldError('eventType')!.message}</div>
          )}
        </div>
      )}

      {/* Duration steps */}
      <div className="form-field">
        <label htmlFor={`task-${index}-duration`}>
          Duration Steps (optional)
        </label>
        <input
          id={`task-${index}-duration`}
          type="number"
          min="1"
          value={task.durationSteps ?? 1}
          onChange={(e) => onChange({ ...task, durationSteps: parseInt(e.target.value, 10) })}
        />
        <small>Number of simulation steps this task takes to execute (default: 1)</small>
      </div>

      {/* Effects editor */}
      <EffectsEditor
        effects={task.effects ?? []}
        onChange={(effects) => onChange({ ...task, effects })}
        errorPrefix={`tasks[${index}].effects`}
        validationErrors={fieldErrors}
      />
    </div>
  );
}
```

### AddTaskMenu Component

```typescript
interface AddTaskMenuProps {
  onAdd: (type: TaskType) => void;
}

export function AddTaskMenu({ onAdd }: AddTaskMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const taskTypes = [
    { type: TaskType.SYNC, label: 'Synchronous', desc: 'Executes immediately' },
    { type: TaskType.TIMER, label: 'setTimeout', desc: 'Delayed macrotask' },
    { type: TaskType.MICROTASK, label: 'Promise/Microtask', desc: 'High priority async' },
    { type: TaskType.FETCH, label: 'fetch', desc: 'Network request' },
    { type: TaskType.DOM_EVENT, label: 'DOM Event', desc: 'User interaction' },
    { type: TaskType.RAF, label: 'requestAnimationFrame', desc: 'Frame callback' },
  ];

  return (
    <div className="add-task-menu">
      <button
        className="btn-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        + Add Task
      </button>

      {isOpen && (
        <div className="task-type-dropdown">
          {taskTypes.map(({ type, label, desc }) => (
            <button
              key={type}
              className="task-type-option"
              onClick={() => {
                onAdd(type);
                setIsOpen(false);
              }}
            >
              <div className="option-label">{label}</div>
              <div className="option-desc">{desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### ExportImportControls Component

```typescript
interface ExportImportControlsProps {
  onExport: () => void;
  onImport: (json: string) => { success: boolean; errors?: ValidationError[] };
  validationResult: ValidationResult<Scenario>;
}

export function ExportImportControls({
  onExport,
  onImport,
  validationResult,
}: ExportImportControlsProps) {
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const result = onImport(json);
      if (!result.success) {
        setImportError(result.errors?.[0]?.message ?? 'Import failed');
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-import-controls">
      <button
        className="btn-secondary"
        onClick={onExport}
        disabled={!validationResult.ok}
        title={validationResult.ok ? 'Download scenario as JSON' : 'Fix validation errors first'}
      >
        Export JSON
      </button>

      <label className="btn-secondary file-upload-btn">
        Import JSON
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>

      {importError && (
        <div className="import-error">{importError}</div>
      )}
    </div>
  );
}
```

## Success Criteria

- [ ] Can add tasks of all types
- [ ] Can remove tasks
- [ ] Can reorder tasks (drag-and-drop or buttons)
- [ ] Can edit all task properties
- [ ] Validation errors shown inline
- [ ] Can edit scenario metadata
- [ ] Export downloads valid JSON
- [ ] Import loads exported scenarios
- [ ] Import shows errors for invalid JSON
- [ ] Builder is responsive on mobile
- [ ] Clear/reset works
- [ ] Effects can be added/removed/edited

## Test Specifications

### Test: Add task adds to list

```typescript
test('adding task updates scenario', () => {
  const { result } = renderHook(() => useScenarioBuilder());
  
  act(() => {
    result.current.addTask(TaskType.SYNC);
  });
  
  expect(result.current.scenario.tasks.length).toBe(1);
  expect(result.current.scenario.tasks[0].type).toBe(TaskType.SYNC);
});
```

### Test: Remove task removes from list

```typescript
test('removing task updates scenario', () => {
  const { result } = renderHook(() => useScenarioBuilder());
  
  act(() => {
    result.current.addTask(TaskType.SYNC);
    result.current.addTask(TaskType.TIMER);
  });
  
  expect(result.current.scenario.tasks.length).toBe(2);
  
  act(() => {
    result.current.removeTask(0);
  });
  
  expect(result.current.scenario.tasks.length).toBe(1);
  expect(result.current.scenario.tasks[0].type).toBe(TaskType.TIMER);
});
```

### Test: Export produces valid JSON

```typescript
test('export produces valid JSON', () => {
  const scenario: Scenario = {
    id: 'test',
    name: 'Test',
    description: 'Test scenario',
    learningObjective: 'Learn',
    tags: [],
    schemaVersion: 1,
    tasks: [
      { type: TaskType.SYNC, label: 'Task 1' },
    ],
  };
  
  const json = JSON.stringify(scenario, null, 2);
  const parsed = JSON.parse(json);
  
  expect(validateScenario(parsed).ok).toBe(true);
});
```

### Test: Import validates JSON

```typescript
test('import rejects invalid JSON', () => {
  const { result } = renderHook(() => useScenarioBuilder());
  
  const invalidJson = '{ invalid json }';
  
  const importResult = result.current.importScenario(invalidJson);
  
  expect(importResult.success).toBe(false);
  expect(importResult.errors).toBeDefined();
});
```

## Integration Points

- **Session 6.1**: Uses validation to show errors
- **Session 6.3/6.4**: Can load presets into builder for editing
- **Phase 2**: Integrates with LOAD_SCENARIO action
- **Phase 3**: Rendered in panel

## References

- [React Hook Form](https://react-hook-form.com/)
- [Validation Session](./session-6.1-schema-validation.md)
- [Task Types](../phase-01-core-simulator/session-1.1-types.md)
- [React DnD](https://react-dnd.github.io/react-dnd/about) (optional for drag-and-drop)

## Notes

- Consider using a form library like React Hook Form
- Consider drag-and-drop library or simple up/down buttons
- Save draft to localStorage on change
- Consider undo/redo for builder actions
- Add keyboard shortcuts (Ctrl+S to export, etc.)
- Consider visual preview of scenario execution
