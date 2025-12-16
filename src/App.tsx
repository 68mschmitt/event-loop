import { useEffect } from 'react';
import { SimulatorProvider } from '@/state/SimulatorContext';
import { AnimationProvider } from '@/animations/AnimationContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLoadScenario } from '@/state/hooks/useLoadScenario';
import { PRESET_SCENARIOS } from '@/scenarios/presets';
import { parseScenario } from '@/scenarios/parser';

function AppContent() {
  const loadScenario = useLoadScenario();

  // Load the first preset scenario on mount
  useEffect(() => {
    try {
      const firstScenario = PRESET_SCENARIOS[0];
      if (firstScenario) {
        const state = parseScenario(firstScenario);
        loadScenario(state);
      }
    } catch (error) {
      console.error('Failed to load default scenario:', error);
    }
  }, [loadScenario]);

  return <AppLayout />;
}

export function App() {
  return (
    <AnimationProvider>
      <SimulatorProvider>
        <AppContent />
      </SimulatorProvider>
    </AnimationProvider>
  );
}
