import { PlaybackControls } from '../controls/PlaybackControls';
import { SpeedControl } from '../controls/SpeedControl';

export function Toolbar() {
  return (
    <div className="h-16 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <h1 className="text-xl font-semibold">Event Loop Visualizer</h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Playback Controls */}
        <PlaybackControls />
        
        {/* Speed Control */}
        <SpeedControl />
      </div>
    </div>
  );
}
