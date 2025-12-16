import { PlaybackControls } from '../controls/PlaybackControls';
import { SpeedControl } from '../controls/SpeedControl';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function Toolbar() {
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      
      <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" aria-hidden="true" />
          <h1 className="text-base sm:text-xl font-semibold">
            {isMobile ? 'Event Loop' : 'Event Loop Visualizer'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Playback Controls */}
          {!isMobile && <PlaybackControls />}
          
          {/* Speed Control */}
          {!isMobile && <SpeedControl />}
        </div>
      </div>
    </>
  );
}
