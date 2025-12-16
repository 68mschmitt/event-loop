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
import { useAriaLive } from '@/hooks/useAriaLive';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ScreenReaderOnly } from '@/components/common/ScreenReaderOnly';

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
  
  const { announce } = useAriaLive();
  const isMobile = useIsMobile();
  
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
        announce(isPlaying ? 'Simulation paused' : 'Simulation playing', { clearAfter: 2000 });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (canStepBackward) {
          stepBackward();
          announce(`Stepped backward to step ${currentStep - 1}`, { clearAfter: 1000 });
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (canStepForward) {
          stepForward();
          announce(`Stepped forward to step ${currentStep + 1}`, { clearAfter: 1000 });
        }
        break;
      case 'KeyR':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          reset();
          announce('Simulation reset to beginning', { clearAfter: 2000 });
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
  
  // Mobile layout: Larger touch targets and stacked layout
  if (isMobile) {
    return (
      <div 
        role="group" 
        aria-label="Playback controls"
        className="flex flex-col gap-3"
      >
        {/* Primary controls */}
        <div className="flex items-center justify-center gap-2">
          <ControlButton
            onClick={stepBackward}
            disabled={!canStepBackward}
            tooltip="Step Back (←)"
            variant="ghost"
            size="lg"
            className="touch-target"
            aria-label="Step backward"
            aria-disabled={!canStepBackward}
          >
            <SkipBack className="w-6 h-6" aria-hidden="true" />
          </ControlButton>
          
          <ControlButton
            onClick={togglePlayPause}
            disabled={!canStepForward && !isPlaying}
            tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            variant="primary"
            size="lg"
            className="touch-target"
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" aria-hidden="true" />
            ) : (
              <Play className="w-7 h-7 ml-0.5" aria-hidden="true" />
            )}
            <ScreenReaderOnly>
              {isPlaying ? 'Pause' : 'Play'}
            </ScreenReaderOnly>
          </ControlButton>
          
          <ControlButton
            onClick={stepForward}
            disabled={!canStepForward}
            tooltip="Step Forward (→)"
            variant="ghost"
            size="lg"
            className="touch-target"
            aria-label="Step forward"
            aria-disabled={!canStepForward}
          >
            <SkipForward className="w-6 h-6" aria-hidden="true" />
          </ControlButton>
        </div>
        
        {/* Step counter */}
        <div className="text-center">
          <div 
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-sm text-zinc-400"
          >
            <ScreenReaderOnly>
              Step {currentStep} of {totalSteps}
            </ScreenReaderOnly>
            <span aria-hidden="true">
              Step <span className="text-zinc-200 font-semibold">{currentStep}</span>
              {totalSteps > 0 && (
                <span className="text-zinc-600"> / {totalSteps}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div 
      role="group" 
      aria-label="Playback controls"
      className="flex items-center gap-2"
    >
      {/* Step backward */}
      <ControlButton
        onClick={stepBackward}
        disabled={!canStepBackward}
        tooltip="Step Back (←)"
        variant="ghost"
        size="md"
        aria-label="Step backward"
        aria-disabled={!canStepBackward}
      >
        <SkipBack className="w-4 h-4" aria-hidden="true" />
      </ControlButton>
      
      {/* Play/Pause */}
      <ControlButton
        onClick={togglePlayPause}
        disabled={!canStepForward && !isPlaying}
        tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        variant="primary"
        size="lg"
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
        )}
        <ScreenReaderOnly>
          {isPlaying ? 'Pause' : 'Play'}
        </ScreenReaderOnly>
      </ControlButton>
      
      {/* Step forward */}
      <ControlButton
        onClick={stepForward}
        disabled={!canStepForward}
        tooltip="Step Forward (→)"
        variant="ghost"
        size="md"
        aria-label="Step forward"
        aria-disabled={!canStepForward}
      >
        <SkipForward className="w-4 h-4" aria-hidden="true" />
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
        aria-label="Reset simulation"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
      </ControlButton>
      
      {/* Step counter */}
      <div className="ml-3 flex items-center gap-2">
        <div 
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm font-mono text-zinc-400"
        >
          <ScreenReaderOnly>
            Step {currentStep} of {totalSteps}
          </ScreenReaderOnly>
          <span aria-hidden="true">
            Step <span className="text-zinc-200 font-semibold">{currentStep}</span>
            {totalSteps > 0 && (
              <span className="text-zinc-600"> / {totalSteps}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
