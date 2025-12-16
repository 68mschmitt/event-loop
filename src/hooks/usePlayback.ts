/**
 * Playback Hook
 * 
 * Manages playback state for the event loop simulator.
 * Handles play, pause, and auto-advance logic.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStepForward } from '@/state/hooks/useStepForward';
import { useStepBack } from '@/state/hooks/useStepBack';
import { useSimulatorSelector } from '@/state/hooks/useSimulator';
import { useAnimationSettings } from '@/animations/AnimationContext';
import { getEffectiveDuration, ANIMATION_DURATIONS } from '@/animations/config';

/**
 * Playback state interface
 */
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  currentStep: number;
  totalSteps: number;
}

/**
 * Playback controls interface
 */
export interface PlaybackControls {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
}

/**
 * Hook for managing playback controls
 */
export function usePlayback(): PlaybackState & PlaybackControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const stepForward = useStepForward();
  const { stepBack: stepBackward, canStepBack: canStepBackward } = useStepBack();
  const { speed } = useAnimationSettings();
  
  // Get simulation state
  const historyLength = useSimulatorSelector(state => state.history.length);
  const currentStep = useSimulatorSelector(state => state.history.length);
  
  // Check if we can step forward by checking if we're not at the end
  // This is a simplified check - in a real scenario, you'd check if simulation can continue
  const canStepForward = true; // Allow stepping forward to generate new steps
  
  const totalSteps = historyLength;
  
  // Use ref to track if we should continue playing
  const shouldPlayRef = useRef(false);
  
  /**
   * Calculate delay between steps based on animation speed
   */
  const getStepDelay = useCallback(() => {
    // Base delay is the longest animation duration
    const baseDelay = ANIMATION_DURATIONS.TASK_MOVE;
    return getEffectiveDuration(baseDelay, speed) + 100; // Add 100ms buffer
  }, [speed]);
  
  /**
   * Start playing
   */
  const play = useCallback(() => {
    if (!canStepForward) return;
    setIsPlaying(true);
    shouldPlayRef.current = true;
  }, [canStepForward]);
  
  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    setIsPlaying(false);
    shouldPlayRef.current = false;
  }, []);
  
  /**
   * Toggle between play and pause
   */
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
  
  /**
   * Reset to beginning (step back to start)
   */
  const reset = useCallback(() => {
    pause();
    // Step back until we can't anymore
    while (canStepBackward) {
      stepBackward();
    }
  }, [pause, canStepBackward, stepBackward]);
  
  /**
   * Auto-advance effect when playing
   */
  useEffect(() => {
    if (!isPlaying || !shouldPlayRef.current) return;
    
    const delay = getStepDelay();
    const timeout = setTimeout(() => {
      if (canStepForward && shouldPlayRef.current) {
        stepForward();
      } else {
        // Reached the end, auto-pause
        pause();
      }
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [isPlaying, canStepForward, stepForward, pause, getStepDelay, currentStep]);
  
  return {
    // State
    isPlaying,
    isPaused: !isPlaying,
    canStepForward,
    canStepBackward,
    currentStep,
    totalSteps,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    stepForward,
    stepBackward,
    reset,
  };
}
