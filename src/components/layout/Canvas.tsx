import { CallStack } from '@/components/visualization/CallStack';
import { WebApis } from '@/components/visualization/WebApis';
import { MacroQueue } from '@/components/visualization/MacroQueue';
import { MicroQueue } from '@/components/visualization/MicroQueue';
import { RafQueue } from '@/components/visualization/RafQueue';
import { Console } from '@/components/visualization/Console';

export function Canvas() {
  return (
    <div className="h-full p-6">
      {/* Grid layout: 3 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left column */}
        <div className="space-y-4">
          <CallStack />
          <WebApis />
        </div>
        
        {/* Center column */}
        <div className="space-y-4">
          <MacroQueue />
          <MicroQueue />
          <RafQueue />
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          <Console />
        </div>
      </div>
    </div>
  );
}
