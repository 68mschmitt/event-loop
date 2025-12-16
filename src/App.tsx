import { SimulatorProvider } from '@/state/SimulatorContext';
import { AppLayout } from '@/components/layout/AppLayout';

export function App() {
  return (
    <SimulatorProvider>
      <AppLayout />
    </SimulatorProvider>
  );
}
