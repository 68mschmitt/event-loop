/**
 * Playback Controls Component
 * 
 * Primary control interface for the event loop simulator.
 * Includes play/pause, step forward/back, and reset buttons.
 */

import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw 
} from 'lucide-react';
import { usePlayback } from '@/hooks/usePlayback';
import { ControlButton } from './ControlButton';
import { useEffect, useCallback } from 'react';

/**
 * Playback controls with keyboard shortcuts
 */
export function PlaybackControls() {
  const {
    isPlaying,
    canStepForward,
    canStepBackward,
    currentStep,
    totalSteps,
    togglePlayPause,
    stepForward,
    stepBackward,
    reset,
  } = usePlayback();
  
  /**
   * Keyboard shortcuts handler
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (canStepBackward) {
          stepBackward();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (canStepForward) {
          stepForward();
        }
        break;
      case 'KeyR':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          reset();
        }
        break;
    }
  }, [togglePlayPause, stepForward, stepBackward, canStepForward, canStepBackward, reset]);
  
  /**
   * Register keyboard shortcuts
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div className="flex items-center gap-2">
      {/* Step backward */}
      <ControlButton
        onClick={stepBackward}
        disabled={!canStepBackward}
        tooltip="Step Back (←)"
        variant="ghost"
        size="md"
      >
        <SkipBack className="w-4 h-4" />
      </ControlButton>
      
      {/* Play/Pause */}
      <ControlButton
        onClick={togglePlayPause}
        disabled={!canStepForward && !isPlaying}
        tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        variant="primary"
        size="lg"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </ControlButton>
      
      {/* Step forward */}
      <ControlButton
        onClick={stepForward}
        disabled={!canStepForward}
        tooltip="Step Forward (→)"
        variant="ghost"
        size="md"
      >
        <SkipForward className="w-4 h-4" />
      </ControlButton>
      
      {/* Divider */}
      <div className="w-px h-8 bg-zinc-700 mx-1" />
      
      {/* Reset */}
      <ControlButton
        onClick={reset}
        disabled={!canStepBackward}
        tooltip="Reset to Start (⌘R)"
        variant="ghost"
        size="md"
      >
        <RotateCcw className="w-4 h-4" />
      </ControlButton>
      
      {/* Step counter */}
      <div className="ml-3 flex items-center gap-2">
        <div className="text-sm font-mono text-zinc-400">
          Step <span className="text-zinc-200 font-semibold">{currentStep}</span>
          {totalSteps > 0 && (
            <span className="text-zinc-600"> / {totalSteps}</span>
          )}
        </div>
      </div>
    </div>
  );
}
