import * as Tabs from '@radix-ui/react-tabs';
import { ExplanationPanel } from './ExplanationPanel';
import { TaskInspector } from './TaskInspector';
import { PresetsPanel } from './PresetsPanel';
import { ScenarioBuilder } from './ScenarioBuilder';

const TABS = [
  { id: 'explanation', label: 'Explanation', component: ExplanationPanel },
  { id: 'inspector', label: 'Inspector', component: TaskInspector },
  { id: 'presets', label: 'Presets', component: PresetsPanel },
  { id: 'builder', label: 'Builder', component: ScenarioBuilder },
] as const;

interface PanelContainerProps {
  defaultTab?: string;
  isMobile?: boolean;
}

export function PanelContainer({ defaultTab = 'explanation', isMobile = false }: PanelContainerProps) {
  return (
    <Tabs.Root 
      defaultValue={defaultTab} 
      className="flex flex-col h-full"
    >
      {/* Tab List */}
      <Tabs.List 
        className={`flex border-b border-zinc-800 bg-zinc-900/50 ${isMobile ? 'text-xs' : ''}`}
        aria-label="Panel tabs"
      >
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className={`
              flex-1 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} font-medium
              text-zinc-400 hover:text-zinc-200
              data-[state=active]:text-zinc-100
              data-[state=active]:border-b-2 data-[state=active]:border-blue-500
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            `}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {TABS.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className={`h-full ${isMobile ? 'p-4' : 'p-6'} focus-visible:outline-none`}
          >
            <tab.component />
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  );
}
