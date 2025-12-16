import { useState } from 'react';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  return (
    <div className="h-screen w-screen flex flex-col lg:grid lg:grid-rows-[auto_1fr_auto] lg:grid-cols-[1fr_400px]">
      {/* Toolbar spans full width */}
      <header className="col-span-full">
        <Toolbar />
      </header>
      
      {/* Main content area - responsive flex/grid */}
      <div className="flex-1 flex flex-col lg:contents overflow-hidden">
        {/* Canvas - main visualization area */}
        <main 
          className="flex-1 overflow-auto bg-zinc-900 lg:col-start-1 lg:row-start-2"
          role="main"
          aria-label="Event loop visualization"
        >
          <Canvas />
        </main>
        
        {/* Sidebar - collapsible on mobile */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>
      
      {/* Timeline at bottom */}
      <footer className="col-span-full border-t border-zinc-800">
        <Timeline />
      </footer>
    </div>
  );
}
