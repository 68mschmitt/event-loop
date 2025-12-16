/**
 * Speed Control Component
 * 
 * Allows users to adjust animation speed with preset buttons and fine-tuning.
 */

import { Gauge } from 'lucide-react';
import { useAnimationContext } from '@/animations/AnimationContext';
import { SPEED_LIMITS } from '@/animations/config';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

/**
 * Speed presets
 */
const SPEED_PRESETS = [
  { label: '0.25×', value: 0.25, key: '1' },
  { label: '0.5×', value: 0.5, key: '2' },
  { label: '1×', value: 1, key: '3' },
  { label: '2×', value: 2, key: '4' },
  { label: '4×', value: 4, key: '5' },
] as const;

/**
 * Local storage key for speed preference
 */
const SPEED_STORAGE_KEY = 'visualizer-speed';

/**
 * Speed control with presets and keyboard shortcuts
 */
export function SpeedControl() {
  const { settings, setSpeed } = useAnimationContext();
  const currentSpeed = settings.speed;
  
  /**
   * Load saved speed from localStorage on mount
   */
  useEffect(() => {
    const savedSpeed = localStorage.getItem(SPEED_STORAGE_KEY);
    if (savedSpeed) {
      const speed = parseFloat(savedSpeed);
      if (!isNaN(speed) && speed >= SPEED_LIMITS.MIN && speed <= SPEED_LIMITS.MAX) {
        setSpeed(speed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /**
   * Save speed to localStorage when it changes
   */
  useEffect(() => {
    localStorage.setItem(SPEED_STORAGE_KEY, currentSpeed.toString());
  }, [currentSpeed]);
  
  /**
   * Handle speed preset selection
   */
  const handlePresetClick = (value: number) => {
    setSpeed(value);
  };
  
  /**
   * Reset to default speed (1x)
   */
  const handleReset = () => {
    setSpeed(SPEED_LIMITS.DEFAULT);
  };
  
  /**
   * Keyboard shortcuts for speed presets (1-5 keys)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Check for number keys 1-5
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 5) {
        const preset = SPEED_PRESETS[keyNum - 1];
        if (preset) {
          e.preventDefault();
          setSpeed(preset.value);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSpeed]);
  
  return (
    <div className="flex items-center gap-3">
      {/* Speed icon */}
      <div className="flex items-center gap-2 text-zinc-400">
        <Gauge className="w-4 h-4" />
        <span className="text-sm font-medium">Speed</span>
      </div>
      
      {/* Speed presets */}
      <div className="flex items-center gap-1">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
              currentSpeed === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            )}
            title={`${preset.label} speed (${preset.key})`}
            aria-label={`Set speed to ${preset.label}`}
            aria-pressed={currentSpeed === preset.value}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      {/* Reset button (only show if not at default) */}
      {currentSpeed !== SPEED_LIMITS.DEFAULT && (
        <button
          onClick={handleReset}
          className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Reset to 1× speed"
          aria-label="Reset to default speed"
        >
          Reset
        </button>
      )}
    </div>
  );
}
