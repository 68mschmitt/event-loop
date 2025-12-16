/**
 * SimulatorContext provides simulator state and dispatch to the component tree.
 * Uses React Context API with useReducer for state management.
 */

import React, { createContext, useReducer, useContext, type ReactNode } from 'react';
import { createInitialState } from '@/core/simulator';
import { simulatorReducer } from './simulatorReducer';
import type { SimulatorAction, SimulatorStateWithHistory } from './types';

/**
 * Context value shape
 */
interface SimulatorContextValue {
  state: SimulatorStateWithHistory;
  dispatch: React.Dispatch<SimulatorAction>;
}

/**
 * Simulator context - provides state and dispatch
 */
const SimulatorContext = createContext<SimulatorContextValue | null>(null);

/**
 * Provider props
 */
interface SimulatorProviderProps {
  children: ReactNode;
  initialState?: SimulatorStateWithHistory;
}

/**
 * SimulatorProvider component - wraps the app to provide simulator state
 */
export function SimulatorProvider({ 
  children, 
  initialState 
}: SimulatorProviderProps) {
  // Create initial state with empty history
  const defaultInitialState: SimulatorStateWithHistory = {
    ...createInitialState(),
    history: [],
  };

  const [state, dispatch] = useReducer(
    simulatorReducer,
    initialState ?? defaultInitialState
  );

  const value: SimulatorContextValue = {
    state,
    dispatch,
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

/**
 * Hook to access simulator state and dispatch
 * @throws Error if used outside SimulatorProvider
 */
export function useSimulatorContext(): SimulatorContextValue {
  const context = useContext(SimulatorContext);
  
  if (context === null) {
    throw new Error('useSimulatorContext must be used within a SimulatorProvider');
  }
  
  return context;
}

/**
 * Hook to access only simulator state (optimized for components that don't dispatch)
 */
export function useSimulatorState(): SimulatorStateWithHistory {
  const { state } = useSimulatorContext();
  return state;
}

/**
 * Hook to access only dispatch function (optimized for components that don't need state)
 */
export function useSimulatorDispatch(): React.Dispatch<SimulatorAction> {
  const { dispatch } = useSimulatorContext();
  return dispatch;
}
