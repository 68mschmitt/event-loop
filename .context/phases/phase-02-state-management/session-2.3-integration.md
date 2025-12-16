# Session 2.3: Context Providers and Integration

## Overview

This session implements React Context providers that wrap the simulator and UI state, making state and dispatch functions available throughout the component tree. Custom hooks provide convenient, type-safe access to state and actions. This completes Phase 2 by integrating Sessions 2.1 and 2.2 into a React-ready state management system.

## Prerequisites

- Session 2.1 complete (history system)
- Session 2.2 complete (reducer and actions)
- Understanding of React Context API
- Understanding of useReducer hook
- Understanding of custom hooks patterns
- Understanding of performance optimization (useMemo, useCallback)

## Goals

- [ ] Implement SimulatorContext provider
- [ ] Implement UIContext provider
- [ ] Create provider composition component
- [ ] Implement useSimulator hook
- [ ] Implement useSimulatorDispatch hook
- [ ] Implement usePlayback hook
- [ ] Implement useStep hook
- [ ] Implement useTimeline hook
- [ ] Implement useUIState hook
- [ ] Optimize context to prevent unnecessary re-renders
- [ ] Write comprehensive hook tests
- [ ] Document hook APIs

## Files to Create/Modify

### `src/state/SimulatorContext.tsx`
**Purpose:** Context for simulator state
**Exports:** `SimulatorContext`, `SimulatorProvider`, `useSimulatorContext`
**Key responsibilities:**
- Provide simulator state to components
- Provide dispatch function for simulator actions
- Manage reducer integration

### `src/state/UIContext.tsx`
**Purpose:** Context for UI state
**Exports:** `UIContext`, `UIProvider`, `useUIContext`
**Key responsibilities:**
- Provide UI state to components
- Provide dispatch function for UI actions
- Keep UI state separate from simulator state

### `src/state/AppProvider.tsx`
**Purpose:** Compose all providers
**Exports:** `AppProvider`
**Key responsibilities:**
- Wrap app with all necessary providers
- Provide correct nesting order
- Single entry point for state setup

### `src/state/hooks/useSimulator.ts`
**Purpose:** Hook for simulator state access
**Exports:** `useSimulator`
**Key responsibilities:**
- Return simulator state
- Memoize selectors
- Type-safe access

### `src/state/hooks/useSimulatorDispatch.ts`
**Purpose:** Hook for simulator dispatch
**Exports:** `useSimulatorDispatch`
**Key responsibilities:**
- Return dispatch function
- Type-safe dispatch
- Stable reference

### `src/state/hooks/usePlayback.ts`
**Purpose:** Hook for playback control
**Exports:** `usePlayback`
**Key responsibilities:**
- Provide playback state (isPlaying, speed)
- Provide playback actions (play, pause, setSpeed)
- Handle playback loop timing

### `src/state/hooks/useStep.ts`
**Purpose:** Hook for step operations
**Exports:** `useStep`
**Key responsibilities:**
- Provide step functions (forward, backward)
- Provide step metadata (canStepBack, canStepForward)
- Memoize expensive calculations

### `src/state/hooks/useTimeline.ts`
**Purpose:** Hook for timeline operations
**Exports:** `useTimeline`
**Key responsibilities:**
- Provide timeline data (current step, total steps)
- Provide navigation (jumpToStep)
- Calculate timeline markers

### `src/state/hooks/index.ts`
**Purpose:** Barrel export for all hooks
**Exports:** Re-exports all hooks

## Type Definitions

### Context Types

```typescript
/**
 * Simulator context value shape.
 */
export interface SimulatorContextValue {
  state: SimulatorState;
  dispatch: React.Dispatch<SimulatorAction>;
}

/**
 * UI context value shape.
 */
export interface UIContextValue {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
}

/**
 * UI state shape.
 */
export interface UIState {
  // Playback
  isPlaying: boolean;
  speed: number; // 0.25, 0.5, 1, 2, 4
  
  // Selection
  selectedTaskId: string | null;
  
  // Settings
  reducedMotion: boolean;
  showExplanations: boolean;
  developerMode: boolean;
}

/**
 * UI actions.
 */
export type UIAction =
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_SPEED'; payload: { speed: number } }
  | { type: 'SELECT_TASK'; payload: { taskId: string | null } }
  | { type: 'TOGGLE_SETTING'; payload: { setting: keyof UIState } }
  | { type: 'SET_REDUCED_MOTION'; payload: { reducedMotion: boolean } };
```

## Implementation Specifications

### SimulatorContext Provider

```typescript
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SimulatorState } from '@/core/types';
import { SimulatorAction } from './types/actions';
import { simulatorReducer, createInitialSimulatorState } from './reducers/simulator';

// Create context with undefined default (will error if used without provider)
const SimulatorContext = createContext<SimulatorContextValue | undefined>(undefined);

interface SimulatorProviderProps {
  children: ReactNode;
  initialState?: SimulatorState;
}

/**
 * Provider for simulator state and dispatch.
 * Wraps children with simulator context.
 */
export function SimulatorProvider({ 
  children, 
  initialState 
}: SimulatorProviderProps) {
  const [state, dispatch] = useReducer(
    simulatorReducer,
    initialState ?? createInitialSimulatorState()
  );
  
  const value = React.useMemo(
    () => ({ state, dispatch }),
    [state, dispatch]
  );
  
  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

/**
 * Hook to access simulator context.
 * Throws error if used outside provider.
 */
export function useSimulatorContext(): SimulatorContextValue {
  const context = useContext(SimulatorContext);
  
  if (context === undefined) {
    throw new Error('useSimulatorContext must be used within SimulatorProvider');
  }
  
  return context;
}
```

### UIContext Provider

```typescript
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UIState, UIAction } from './types/ui';
import { uiReducer, createInitialUIState } from './reducers/ui';

const UIContext = createContext<UIContextValue | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
  initialState?: UIState;
}

export function UIProvider({ children, initialState }: UIProviderProps) {
  const [state, dispatch] = useReducer(
    uiReducer,
    initialState ?? createInitialUIState()
  );
  
  const value = React.useMemo(
    () => ({ state, dispatch }),
    [state, dispatch]
  );
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext(): UIContextValue {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUIContext must be used within UIProvider');
  }
  
  return context;
}
```

### UI Reducer

```typescript
import { produce } from 'immer';
import { UIState, UIAction } from '../types/ui';

export function createInitialUIState(): UIState {
  // Check for user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    isPlaying: false,
    speed: 1,
    selectedTaskId: null,
    reducedMotion: prefersReducedMotion,
    showExplanations: true,
    developerMode: false,
  };
}

export function uiReducer(state: UIState, action: UIAction): UIState {
  return produce(state, draft => {
    switch (action.type) {
      case 'TOGGLE_PLAY':
        draft.isPlaying = !draft.isPlaying;
        break;
      
      case 'SET_SPEED':
        draft.speed = action.payload.speed;
        break;
      
      case 'SELECT_TASK':
        draft.selectedTaskId = action.payload.taskId;
        break;
      
      case 'TOGGLE_SETTING':
        const setting = action.payload.setting;
        draft[setting] = !draft[setting] as any;
        break;
      
      case 'SET_REDUCED_MOTION':
        draft.reducedMotion = action.payload.reducedMotion;
        break;
      
      default:
        const _exhaustive: never = action;
        return _exhaustive;
    }
  });
}
```

### App Provider (Composition)

```typescript
import React, { ReactNode } from 'react';
import { SimulatorProvider } from './SimulatorContext';
import { UIProvider } from './UIContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Composes all application providers.
 * Provides correct nesting order for context dependencies.
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <SimulatorProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </SimulatorProvider>
  );
}
```

**Usage in App:**
```tsx
import { AppProvider } from './state/AppProvider';

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
```

### Custom Hooks

#### useSimulator Hook

```typescript
import { useSimulatorContext } from '../SimulatorContext';

/**
 * Hook to access simulator state.
 * Returns the complete simulator state.
 */
export function useSimulator() {
  const { state } = useSimulatorContext();
  return state;
}
```

#### useSimulatorDispatch Hook

```typescript
import { useSimulatorContext } from '../SimulatorContext';

/**
 * Hook to access simulator dispatch function.
 * Returns type-safe dispatch for simulator actions.
 */
export function useSimulatorDispatch() {
  const { dispatch } = useSimulatorContext();
  return dispatch;
}
```

#### useStep Hook

```typescript
import React from 'react';
import { useSimulator } from './useSimulator';
import { useSimulatorDispatch } from './useSimulatorDispatch';
import { stepForward, stepBackward } from '../actions/simulator';
import { getHistoryNavigationInfo } from '../history';

/**
 * Hook for step operations (forward, backward).
 * Provides step functions and navigation metadata.
 */
export function useStep() {
  const state = useSimulator();
  const dispatch = useSimulatorDispatch();
  
  // Memoize navigation info (expensive calculation)
  const navInfo = React.useMemo(
    () => getHistoryNavigationInfo(state),
    [state.historyPosition, state.history.length]
  );
  
  // Memoize callbacks
  const forward = React.useCallback(() => {
    dispatch(stepForward());
  }, [dispatch]);
  
  const backward = React.useCallback(() => {
    dispatch(stepBackward());
  }, [dispatch]);
  
  return {
    forward,
    backward,
    canStepBack: navInfo.canStepBack,
    canStepForward: navInfo.canStepForward,
    currentStep: state.stepIndex,
    isComplete: state.isComplete,
  };
}
```

#### usePlayback Hook

```typescript
import React from 'react';
import { useUIContext } from '../UIContext';
import { useSimulatorDispatch } from './useSimulatorDispatch';
import { stepForward } from '../actions/simulator';

/**
 * Hook for playback control.
 * Handles play/pause, speed control, and automatic stepping.
 */
export function usePlayback() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const simulatorDispatch = useSimulatorDispatch();
  
  // Handle automatic playback loop
  React.useEffect(() => {
    if (!uiState.isPlaying) {
      return; // Not playing, no interval needed
    }
    
    // Calculate interval based on speed
    // Base interval: 500ms per step at 1x speed
    const baseInterval = 500;
    const interval = baseInterval / uiState.speed;
    
    const timerId = setInterval(() => {
      simulatorDispatch(stepForward());
    }, interval);
    
    return () => clearInterval(timerId);
  }, [uiState.isPlaying, uiState.speed, simulatorDispatch]);
  
  // Memoize callbacks
  const play = React.useCallback(() => {
    uiDispatch({ type: 'TOGGLE_PLAY' });
  }, [uiDispatch]);
  
  const pause = React.useCallback(() => {
    uiDispatch({ type: 'TOGGLE_PLAY' });
  }, [uiDispatch]);
  
  const toggle = React.useCallback(() => {
    uiDispatch({ type: 'TOGGLE_PLAY' });
  }, [uiDispatch]);
  
  const setSpeed = React.useCallback((speed: number) => {
    uiDispatch({ type: 'SET_SPEED', payload: { speed } });
  }, [uiDispatch]);
  
  return {
    isPlaying: uiState.isPlaying,
    speed: uiState.speed,
    play,
    pause,
    toggle,
    setSpeed,
  };
}
```

#### useTimeline Hook

```typescript
import React from 'react';
import { useSimulator } from './useSimulator';
import { useSimulatorDispatch } from './useSimulatorDispatch';
import { jumpToStep } from '../actions/simulator';

/**
 * Hook for timeline operations.
 * Provides timeline data and navigation functions.
 */
export function useTimeline() {
  const state = useSimulator();
  const dispatch = useSimulatorDispatch();
  
  // Calculate timeline markers (steps with significant events)
  const markers = React.useMemo(() => {
    return state.history
      .filter(snapshot => snapshot.description) // Only snapshots with descriptions
      .map(snapshot => ({
        stepIndex: snapshot.stepIndex,
        label: snapshot.description!,
      }));
  }, [state.history]);
  
  // Jump to step callback
  const jump = React.useCallback((stepIndex: number) => {
    dispatch(jumpToStep(stepIndex));
  }, [dispatch]);
  
  return {
    currentStep: state.stepIndex,
    totalSteps: state.history.length,
    markers,
    jump,
    progress: state.history.length > 0 
      ? state.stepIndex / state.history.length 
      : 0,
  };
}
```

## Success Criteria

- [ ] SimulatorContext provides state and dispatch
- [ ] UIContext provides UI state and dispatch
- [ ] Contexts throw error when used outside provider
- [ ] AppProvider correctly composes all providers
- [ ] All custom hooks work correctly
- [ ] Hooks are memoized (no unnecessary re-renders)
- [ ] Hook tests pass with @testing-library/react
- [ ] Integration tests verify full state flow
- [ ] TypeScript types are correct (no `any`)

## Test Specifications

### Test: SimulatorContext throws without provider

**Given:** Component using useSimulatorContext
**When:** Rendered outside SimulatorProvider
**Then:** Throws error with helpful message

```typescript
import { renderHook } from '@testing-library/react';
import { useSimulatorContext } from '../SimulatorContext';

test('useSimulatorContext throws without provider', () => {
  // Should throw when used outside provider
  expect(() => {
    renderHook(() => useSimulatorContext());
  }).toThrow('useSimulatorContext must be used within SimulatorProvider');
});
```

### Test: SimulatorContext provides state

**Given:** Component using useSimulator
**When:** Rendered inside SimulatorProvider
**Then:** Returns simulator state

```typescript
import { renderHook } from '@testing-library/react';
import { SimulatorProvider } from '../SimulatorContext';
import { useSimulator } from '../hooks/useSimulator';

test('useSimulator returns state', () => {
  const wrapper = ({ children }) => (
    <SimulatorProvider>{children}</SimulatorProvider>
  );
  
  const { result } = renderHook(() => useSimulator(), { wrapper });
  
  expect(result.current).toBeDefined();
  expect(result.current.stepIndex).toBe(0);
  expect(result.current.callStack).toEqual([]);
});
```

### Test: useStep provides forward/backward functions

**Given:** useStep hook
**When:** Called within providers
**Then:** Returns step functions that work

```typescript
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../AppProvider';
import { useStep } from '../hooks/useStep';

test('useStep provides working step functions', () => {
  const wrapper = ({ children }) => (
    <AppProvider>{children}</AppProvider>
  );
  
  const { result } = renderHook(() => useStep(), { wrapper });
  
  // Initially at step 0
  expect(result.current.currentStep).toBe(0);
  expect(result.current.canStepBack).toBe(false);
  
  // Step forward
  act(() => {
    result.current.forward();
  });
  
  // Now at step 1
  expect(result.current.currentStep).toBe(1);
  expect(result.current.canStepBack).toBe(true);
  
  // Step backward
  act(() => {
    result.current.backward();
  });
  
  // Back to step 0
  expect(result.current.currentStep).toBe(0);
});
```

### Test: usePlayback handles play/pause

**Given:** usePlayback hook
**When:** Toggle play
**Then:** isPlaying state updates

```typescript
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../AppProvider';
import { usePlayback } from '../hooks/usePlayback';

test('usePlayback handles play/pause', () => {
  const wrapper = ({ children }) => (
    <AppProvider>{children}</AppProvider>
  );
  
  const { result } = renderHook(() => usePlayback(), { wrapper });
  
  // Initially paused
  expect(result.current.isPlaying).toBe(false);
  
  // Play
  act(() => {
    result.current.play();
  });
  
  expect(result.current.isPlaying).toBe(true);
  
  // Pause
  act(() => {
    result.current.pause();
  });
  
  expect(result.current.isPlaying).toBe(false);
});
```

### Test: useTimeline provides jump function

**Given:** useTimeline hook with history
**When:** Call jump(5)
**Then:** Simulator jumps to step 5

```typescript
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../AppProvider';
import { useTimeline } from '../hooks/useTimeline';
import { useStep } from '../hooks/useStep';

test('useTimeline jump navigates to step', () => {
  const wrapper = ({ children }) => (
    <AppProvider>{children}</AppProvider>
  );
  
  // Setup: advance to step 10
  const { result: stepResult } = renderHook(() => useStep(), { wrapper });
  
  act(() => {
    for (let i = 0; i < 10; i++) {
      stepResult.current.forward();
    }
  });
  
  // Use timeline to jump to step 5
  const { result: timelineResult } = renderHook(() => useTimeline(), { wrapper });
  
  act(() => {
    timelineResult.current.jump(5);
  });
  
  expect(timelineResult.current.currentStep).toBe(5);
});
```

### Test: Context splitting prevents re-renders

**Given:** Component using only UIContext
**When:** Simulator state updates
**Then:** Component does not re-render

```typescript
import { renderHook } from '@testing-library/react';
import { AppProvider } from '../AppProvider';
import { useUIContext } from '../UIContext';
import { useSimulatorDispatch } from '../hooks/useSimulatorDispatch';

test('UI context does not re-render on simulator changes', () => {
  const wrapper = ({ children }) => (
    <AppProvider>{children}</AppProvider>
  );
  
  let renderCount = 0;
  
  const { result: uiResult } = renderHook(() => {
    renderCount++;
    return useUIContext();
  }, { wrapper });
  
  const { result: dispatchResult } = renderHook(
    () => useSimulatorDispatch(), 
    { wrapper }
  );
  
  const initialRenderCount = renderCount;
  
  // Dispatch simulator action
  act(() => {
    dispatchResult.current(stepForward());
  });
  
  // UI context consumer should not re-render
  expect(renderCount).toBe(initialRenderCount);
});
```

## Integration Points

- **Session 2.1**: Uses history functions in hooks
- **Session 2.2**: Uses reducer and actions in providers
- **Phase 3**: UI components will use these hooks
- **Phase 4**: Animation coordinator will subscribe to state changes
- **Phase 5**: Controls will use usePlayback and useStep hooks

## References

- [React Context API](https://react.dev/reference/react/useContext)
- [useReducer Hook](https://react.dev/reference/react/useReducer)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library React Hooks](https://react-hooks-testing-library.com/)
- [Session 2.1 History System](./session-2.1-history.md)
- [Session 2.2 Reducer](./session-2.2-actions.md)

## Notes

### Why Split Contexts?

Splitting SimulatorContext and UIContext prevents unnecessary re-renders:

**Problem with single context:**
```tsx
// Every component re-renders on any state change
const { simulatorState, uiState } = useAppState();
```

**Solution with split contexts:**
```tsx
// Only re-renders when relevant state changes
const uiState = useUIState();  // No re-render on simulator changes
const simState = useSimulator(); // No re-render on UI changes
```

### Hook Naming Convention

- `use[Thing]`: Returns state (e.g., `useSimulator`)
- `use[Thing]Dispatch`: Returns dispatch (e.g., `useSimulatorDispatch`)
- `use[Feature]`: Returns feature API (e.g., `usePlayback`)

### Memoization Strategy

Memoize:
- Context values (prevent provider re-renders)
- Callbacks passed to children (prevent child re-renders)
- Expensive calculations (history navigation)

Don't memoize:
- Simple primitive values
- Values that change every render anyway

### Testing Strategy

Test hooks at multiple levels:
1. **Unit**: Individual hooks with minimal wrapper
2. **Integration**: Multiple hooks working together
3. **E2E**: Full component tree with real interactions

### Performance Considerations

- Context splitting reduces re-renders
- useMemo prevents expensive recalculations
- useCallback prevents child re-renders
- Reducer is memoized by React automatically

### Error Boundaries

Context errors (undefined) are caught by:
- Type system (TypeScript catches at compile time)
- Runtime error with helpful message
- Should never happen in production if properly wrapped
