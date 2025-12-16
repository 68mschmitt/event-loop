import { CallStack } from '@/components/visualization/CallStack';
import { WebApis } from '@/components/visualization/WebApis';
import { MacroQueue } from '@/components/visualization/MacroQueue';
import { MicroQueue } from '@/components/visualization/MicroQueue';
import { RafQueue } from '@/components/visualization/RafQueue';
import { Console } from '@/components/visualization/Console';

import { useIsMobile } from '@/hooks/useMediaQuery';

export function Canvas() {
  const isMobile = useIsMobile();
  
  return (
    <div 
      id="main-content"
      tabIndex={-1}
      className="h-full p-3 sm:p-4 md:p-6"
    >
      {/* Grid layout: 1 column on mobile, 3 columns on desktop */}
      <div className={`grid gap-3 sm:gap-4 h-full ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Left column */}
        <div className="space-y-3 sm:space-y-4">
          <CallStack />
          <WebApis />
        </div>
        
        {/* Center column */}
        <div className="space-y-3 sm:space-y-4">
          <MacroQueue />
          <MicroQueue />
          <RafQueue />
        </div>
        
        {/* Right column */}
        <div className="space-y-3 sm:space-y-4">
          <Console />
        </div>
      </div>
    </div>
  );
}
