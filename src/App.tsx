import { SimulatorProvider } from '@/state/SimulatorContext';
import { AnimationProvider } from '@/animations/AnimationContext';
import { AppLayout } from '@/components/layout/AppLayout';

export function App() {
  return (
    <AnimationProvider>
      <SimulatorProvider>
        <AppLayout />
      </SimulatorProvider>
    </AnimationProvider>
  );
}
