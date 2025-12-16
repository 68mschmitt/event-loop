/**
 * Example demonstrating Phase 2 State Management API usage
 * 
 * This file shows how to use the state management layer to control
 * the event loop simulator with React hooks.
 */

import React from 'react';
import { 
  SimulatorProvider, 
  useSimulator, 
  useStepForward, 
  useStepBack,
  useHistory,
  useCurrentStep,
  useCurrentTime,
  useIsSimulationComplete,
} from './src/state';

/**
 * Main App Component - Wraps everything in SimulatorProvider
 */
function App() {
  return (
    <SimulatorProvider>
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Event Loop Visualizer - Phase 2 Demo</h1>
        <SimulatorControls />
        <SimulatorStatus />
        <HistoryControls />
      </div>
    </SimulatorProvider>
  );
}

/**
 * Basic playback controls
 */
function SimulatorControls() {
  const stepForward = useStepForward();
  const { stepBack, canStepBack } = useStepBack();
  const { reset } = useHistory();
  const isComplete = useIsSimulationComplete();

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Controls</h2>
      <button onClick={stepForward} disabled={isComplete}>
        Step Forward
      </button>
      <button onClick={stepBack} disabled={!canStepBack} style={{ marginLeft: '10px' }}>
        Step Back
      </button>
      <button onClick={reset} style={{ marginLeft: '10px' }}>
        Reset
      </button>
    </div>
  );
}

/**
 * Display current simulation status
 */
function SimulatorStatus() {
  const state = useSimulator();
  const currentStep = useCurrentStep();
  const currentTime = useCurrentTime();
  const isComplete = useIsSimulationComplete();

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Status</h2>
      <p><strong>Step:</strong> {currentStep}</p>
      <p><strong>Time:</strong> {currentTime}ms</p>
      <p><strong>Complete:</strong> {isComplete ? 'Yes' : 'No'}</p>
      <p><strong>Call Stack:</strong> {state.callStack.length} frames</p>
      <p><strong>Macro Queue:</strong> {state.macroQueue.length} tasks</p>
      <p><strong>Micro Queue:</strong> {state.microQueue.length} tasks</p>
      <p><strong>RAF Queue:</strong> {state.rafQueue.length} tasks</p>
      <p><strong>Web APIs:</strong> {state.webApis.size} operations</p>
    </div>
  );
}

/**
 * Time-travel history controls
 */
function HistoryControls() {
  const { history, historySize, jumpToStep, isAtCapacity } = useHistory();
  const currentStep = useCurrentStep();

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>History (Time Travel)</h2>
      <p>
        <strong>Size:</strong> {historySize} snapshots
        {isAtCapacity && <span style={{ color: 'orange' }}> (at capacity)</span>}
      </p>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Jump to step:</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
          {history.map((snapshot) => (
            <button
              key={snapshot.stepIndex}
              onClick={() => jumpToStep(snapshot.stepIndex)}
              disabled={snapshot.stepIndex === currentStep}
              style={{
                backgroundColor: snapshot.stepIndex === currentStep ? '#007bff' : '#fff',
                color: snapshot.stepIndex === currentStep ? '#fff' : '#000',
                border: '1px solid #007bff',
                padding: '5px 10px',
                cursor: snapshot.stepIndex === currentStep ? 'default' : 'pointer',
              }}
            >
              {snapshot.stepIndex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

/**
 * Usage Examples:
 * 
 * 1. Basic Step Forward:
 * ```tsx
 * function MyComponent() {
 *   const stepForward = useStepForward();
 *   return <button onClick={stepForward}>Next Step</button>;
 * }
 * ```
 * 
 * 2. Selective State Access:
 * ```tsx
 * function TimeDisplay() {
 *   const currentTime = useCurrentTime();
 *   return <p>Time: {currentTime}ms</p>;
 * }
 * ```
 * 
 * 3. History Navigation:
 * ```tsx
 * function HistoryTimeline() {
 *   const { history, jumpToStep } = useHistory();
 *   return (
 *     <div>
 *       {history.map(snapshot => (
 *         <button key={snapshot.stepIndex} onClick={() => jumpToStep(snapshot.stepIndex)}>
 *           Step {snapshot.stepIndex}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * 4. Load Custom Scenario:
 * ```tsx
 * function ScenarioLoader() {
 *   const loadScenario = useLoadScenario();
 *   
 *   const handleLoad = () => {
 *     const customState = createInitialState();
 *     // ... customize state ...
 *     loadScenario(customState);
 *   };
 *   
 *   return <button onClick={handleLoad}>Load Scenario</button>;
 * }
 * ```
 */
