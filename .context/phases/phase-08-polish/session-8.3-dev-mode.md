# Session 8.3: Error States and Developer Mode

## Overview

This session implements **error handling**, **validation error display**, and a **developer panel** with advanced debugging features. This ensures the application gracefully handles errors and provides power users with tools for deep inspection and scenario sharing.

## Prerequisites

- Phase 1 completed (core types and validation)
- Phase 2 completed (state management with reducers)
- Phase 3 completed (UI scaffolding)
- Phase 6 completed (scenario system)
- Understanding of React error boundaries

## Goals

- [ ] Create Error Boundary components
- [ ] Display validation errors clearly
- [ ] Build DeveloperPanel with state viewer
- [ ] Implement JSON state export
- [ ] Implement scenario export
- [ ] Implement scenario import
- [ ] Add developer mode toggle
- [ ] Show helpful error messages
- [ ] Provide recovery actions

## Files to Create/Modify

### `src/components/errors/ErrorBoundary.tsx`
**Purpose:** React error boundary to catch component errors
**Exports:** `ErrorBoundary`
**Key responsibilities:**
- Catch React rendering errors
- Display fallback UI
- Log errors for debugging
- Provide recovery actions

### `src/components/errors/ValidationError.tsx`
**Purpose:** Display validation errors
**Exports:** `ValidationError`
**Key responsibilities:**
- Format validation error messages
- Highlight affected fields
- Show recovery suggestions
- Support multiple errors

### `src/components/panels/DeveloperPanel/DeveloperPanel.tsx`
**Purpose:** Main developer tools panel
**Exports:** `DeveloperPanel`
**Key responsibilities:**
- Toggle developer mode
- Show/hide advanced features
- Container for dev tools

### `src/components/panels/DeveloperPanel/StateViewer.tsx`
**Purpose:** JSON tree viewer for state
**Exports:** `StateViewer`
**Key responsibilities:**
- Display state as formatted JSON
- Collapsible tree structure
- Copy to clipboard
- Filter/search functionality

### `src/components/panels/DeveloperPanel/ExportButton.tsx`
**Purpose:** Export scenario to JSON
**Exports:** `ExportButton`
**Key responsibilities:**
- Serialize current scenario
- Download as JSON file
- Include metadata
- Handle export errors

### `src/components/panels/DeveloperPanel/ImportButton.tsx`
**Purpose:** Import scenario from JSON
**Exports:** `ImportButton`
**Key responsibilities:**
- File upload interface
- Parse and validate JSON
- Load scenario into simulator
- Handle import errors

### `src/utils/serialization.ts`
**Purpose:** Serialization utilities
**Exports:** `serializeScenario`, `deserializeScenario`, `serializeState`
**Key responsibilities:**
- Convert scenarios to JSON
- Handle special types (Map, etc.)
- Validate on import
- Pretty-print JSON

### `src/utils/validation.ts` (modify)
**Purpose:** Enhanced validation with helpful messages
**Additions:** Better error messages, field-specific validation
**Key responsibilities:**
- Validate scenario structure
- Validate task properties
- Return detailed error info
- Suggest fixes

## Type Definitions

```typescript
/**
 * Error boundary state.
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Validation error with context.
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  suggestion?: string;
  severity: 'error' | 'warning';
}

/**
 * Validation result.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Scenario export format.
 */
export interface ScenarioExport {
  version: string;             // Format version (e.g., "1.0.0")
  scenario: Scenario;
  metadata: {
    exportedAt: string;        // ISO timestamp
    exportedBy: string;        // App version
    appUrl?: string;
  };
}

/**
 * State export format (for debugging).
 */
export interface StateExport {
  version: string;
  state: SimulatorState;
  metadata: {
    exportedAt: string;
    stepIndex: number;
    timestamp: number;
  };
}

/**
 * Props for ErrorBoundary.
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Props for ValidationError display.
 */
export interface ValidationErrorProps {
  errors: ValidationError[];
  onDismiss?: () => void;
}

/**
 * Props for DeveloperPanel.
 */
export interface DeveloperPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props for StateViewer.
 */
export interface StateViewerProps {
  state: SimulatorState;
  expanded?: boolean;
  maxDepth?: number;
}
```

## Implementation Specifications

### ErrorBoundary Component

```typescript
// src/components/errors/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    this.setState({
      errorInfo
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={this.reset} />;
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                The application encountered an unexpected error. You can try
                resetting the view or reloading the page.
              </p>
            </div>
            
            {error && (
              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                  {error.toString()}
                  {errorInfo && `\n\n${errorInfo.componentStack}`}
                </pre>
              </details>
            )}
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={onReset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### ValidationError Component

```typescript
// src/components/errors/ValidationError.tsx

export function ValidationError({ errors, onDismiss }: ValidationErrorProps) {
  if (errors.length === 0) return null;
  
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  
  return (
    <div
      className="border-l-4 border-red-400 bg-red-50 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
            {errorCount > 0 && warningCount > 0 && ' and '}
            {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{error.field}:</span>{' '}
                  {error.message}
                  {error.suggestion && (
                    <div className="mt-1 text-red-600">
                      💡 {error.suggestion}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### DeveloperPanel Component

```typescript
// src/components/panels/DeveloperPanel/DeveloperPanel.tsx

export function DeveloperPanel({ isOpen, onClose }: DeveloperPanelProps) {
  const { state } = useSimulator();
  const [activeTab, setActiveTab] = useState<'state' | 'export' | 'import'>('state');
  
  if (!isOpen) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Tools"
      size="xlarge"
    >
      <div className="flex flex-col h-full">
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('state')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'state'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              State Inspector
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'export'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'import'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Import
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'state' && (
            <StateViewer state={state} />
          )}
          
          {activeTab === 'export' && (
            <ExportPanel />
          )}
          
          {activeTab === 'import' && (
            <ImportPanel />
          )}
        </div>
      </div>
    </Modal>
  );
}
```

### StateViewer Component

```typescript
// src/components/panels/DeveloperPanel/StateViewer.tsx

export function StateViewer({ state, expanded = false, maxDepth = 3 }: StateViewerProps) {
  const [copied, setCopied] = useState(false);
  
  const json = useMemo(() => {
    return JSON.stringify(serializeState(state), null, 2);
  }, [state]);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Simulator State (Step {state.stepIndex})
        </h4>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          {copied ? '✓ Copied!' : 'Copy JSON'}
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <pre className="text-xs text-gray-800 font-mono">
          <code>{json}</code>
        </pre>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>
          This is the complete internal state of the simulator. You can copy this
          for debugging or sharing bug reports.
        </p>
      </div>
    </div>
  );
}
```

### Export & Import Components

```typescript
// src/components/panels/DeveloperPanel/ExportButton.tsx

export function ExportPanel() {
  const { state } = useSimulator();
  const [format, setFormat] = useState<'scenario' | 'state'>('scenario');
  
  const handleExport = () => {
    const data = format === 'scenario' 
      ? serializeScenario(/* current scenario */)
      : serializeState(state);
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-loop-${format}-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Format
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'scenario' | 'state')}
          className="block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="scenario">Scenario (shareable)</option>
          <option value="state">Full State (debugging)</option>
        </select>
      </div>
      
      <div className="text-sm text-gray-600">
        {format === 'scenario' ? (
          <p>
            Exports the current scenario definition. You can share this file with others
            or import it later.
          </p>
        ) : (
          <p>
            Exports the complete simulator state including history. Useful for debugging
            or reporting bugs.
          </p>
        )}
      </div>
      
      <button
        onClick={handleExport}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download {format === 'scenario' ? 'Scenario' : 'State'} JSON
      </button>
    </div>
  );
}

// src/components/panels/DeveloperPanel/ImportButton.tsx

export function ImportPanel() {
  const dispatch = useSimulatorDispatch();
  const [error, setError] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate
      const validation = validateScenarioExport(data);
      if (!validation.valid) {
        setError(validation.errors);
        return;
      }
      
      // Deserialize and load
      const scenario = deserializeScenario(data);
      dispatch({ type: 'LOAD_SCENARIO', payload: scenario });
      
      setError([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError([{
        field: 'file',
        message: err instanceof Error ? err.message : 'Invalid JSON file',
        severity: 'error'
      }]);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p>
          Import a scenario JSON file exported from this application or created manually.
        </p>
      </div>
      
      {error.length > 0 && (
        <ValidationError errors={error} onDismiss={() => setError([])} />
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-700">
            ✓ Scenario imported successfully!
          </p>
        </div>
      )}
      
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </label>
      
      <div className="text-xs text-gray-500">
        <p>
          Supported format: Scenario Export JSON (version 1.0.0)
        </p>
      </div>
    </div>
  );
}
```

### Serialization Utilities

```typescript
// src/utils/serialization.ts

const EXPORT_VERSION = '1.0.0';

/**
 * Serialize scenario for export.
 */
export function serializeScenario(scenario: Scenario): ScenarioExport {
  return {
    version: EXPORT_VERSION,
    scenario: {
      ...scenario,
      // Ensure all fields are serializable
    },
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: `Event Loop Visualizer v${APP_VERSION}`,
      appUrl: window.location.origin
    }
  };
}

/**
 * Deserialize imported scenario.
 */
export function deserializeScenario(data: ScenarioExport): Scenario {
  if (data.version !== EXPORT_VERSION) {
    throw new Error(`Unsupported format version: ${data.version}`);
  }
  
  return data.scenario;
}

/**
 * Serialize simulator state (for debugging).
 */
export function serializeState(state: SimulatorState): StateExport {
  return {
    version: EXPORT_VERSION,
    state: {
      ...state,
      // Convert Map to object
      webApis: Object.fromEntries(state.webApis)
    },
    metadata: {
      exportedAt: new Date().toISOString(),
      stepIndex: state.stepIndex,
      timestamp: state.now
    }
  };
}

/**
 * Validate scenario export format.
 */
export function validateScenarioExport(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!data.version) {
    errors.push({
      field: 'version',
      message: 'Missing version field',
      severity: 'error'
    });
  }
  
  if (!data.scenario) {
    errors.push({
      field: 'scenario',
      message: 'Missing scenario field',
      severity: 'error'
    });
  }
  
  if (data.scenario) {
    const scenarioErrors = validateScenario(data.scenario);
    errors.push(...scenarioErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

## JSON Export Format

```json
{
  "version": "1.0.0",
  "scenario": {
    "id": "preset-1",
    "name": "Sync vs setTimeout(0)",
    "description": "Demonstrates that setTimeout(0) runs after synchronous code",
    "learningObjective": "Understand macrotask queue priority",
    "tasks": [
      {
        "type": "sync",
        "label": "console.log('A')",
        "durationSteps": 1,
        "effects": [
          { "type": "log", "payload": "A" }
        ]
      },
      {
        "type": "timer",
        "label": "setTimeout(() => console.log('B'), 0)",
        "delay": 0,
        "durationSteps": 1,
        "effects": [
          { "type": "log", "payload": "B" }
        ]
      }
    ],
    "tags": ["macrotask", "timer", "basics"]
  },
  "metadata": {
    "exportedAt": "2025-01-15T10:30:00.000Z",
    "exportedBy": "Event Loop Visualizer v1.0.0",
    "appUrl": "https://event-loop-viz.dev"
  }
}
```

## Success Criteria

- [ ] ErrorBoundary catches rendering errors
- [ ] Error fallback UI displays with helpful info
- [ ] Can recover from errors without reload
- [ ] Validation errors show with specific messages
- [ ] Suggestions provided for common errors
- [ ] Developer panel accessible via settings
- [ ] State viewer shows complete JSON
- [ ] Can copy state to clipboard
- [ ] Scenario export downloads valid JSON
- [ ] Scenario import validates and loads
- [ ] Import errors display clearly
- [ ] Round-trip (export → import) preserves scenario
- [ ] All features keyboard accessible

## Test Specifications

### Test: ErrorBoundary catches errors
**Given:** Component that throws error
**When:** Error is thrown during render
**Then:** Boundary catches and shows fallback

```typescript
test('error boundary catches rendering errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Test: Validation errors display
**Given:** Array of validation errors
**When:** ValidationError component renders
**Then:** All errors displayed with fields

```typescript
test('displays validation errors', () => {
  const errors = [
    { field: 'delay', message: 'Must be positive', severity: 'error' },
    { field: 'label', message: 'Label is required', severity: 'error' }
  ];
  
  const { getByText } = render(<ValidationError errors={errors} />);
  
  expect(getByText(/delay/i)).toBeInTheDocument();
  expect(getByText(/must be positive/i)).toBeInTheDocument();
});
```

### Test: Export generates valid JSON
**Given:** Current scenario
**When:** serializeScenario() is called
**Then:** Returns valid ScenarioExport object

```typescript
test('serializes scenario to valid format', () => {
  const scenario = createTestScenario();
  
  const exported = serializeScenario(scenario);
  
  expect(exported.version).toBe('1.0.0');
  expect(exported.scenario).toEqual(scenario);
  expect(exported.metadata.exportedAt).toBeTruthy();
});
```

### Test: Import validates and loads
**Given:** Valid JSON file
**When:** File is imported
**Then:** Scenario loads without errors

```typescript
test('imports valid scenario', async () => {
  const validJson = JSON.stringify(createTestScenarioExport());
  const file = new File([validJson], 'test.json', { type: 'application/json' });
  
  const { getByLabelText, getByText } = render(<ImportPanel />);
  const input = getByLabelText(/choose file/i);
  
  fireEvent.change(input, { target: { files: [file] } });
  
  await waitFor(() => {
    expect(getByText(/imported successfully/i)).toBeInTheDocument();
  });
});
```

## Integration Points

- **Phase 1**: Uses validation from core
- **Phase 2**: State export includes full state
- **Phase 6**: Export/import scenarios
- **All phases**: Error boundary wraps entire app

## References

- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [JSON Schema](https://json-schema.org/)
- [Scenario Validation](../phase-06-scenarios/session-6.1-schema.md)

## Notes

- Wrap entire app in top-level ErrorBoundary
- Consider separate boundaries for major features
- Log errors to monitoring service in production
- Include source maps for better error stack traces
- Test error recovery flows
- Support URL-based scenario sharing in future
- Add telemetry for error frequency analysis
