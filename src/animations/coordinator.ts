/**
 * Animation Coordinator
 * 
 * Central hook that manages animation detection, queuing, and execution.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { SimulatorState } from '../core/types/simulator';
import type { AnimationCallbacks, AnimationSettings } from './types';
import { detectChanges, shouldAnimate } from './detector';
import { AnimationQueue } from './queue';

/**
 * Hook to coordinate animations based on state changes
 */
export function useAnimationCoordinator(
  currentState: SimulatorState | null,
  settings: AnimationSettings,
  callbacks?: AnimationCallbacks
) {
  const prevStateRef = useRef<SimulatorState | null>(null);
  const queueRef = useRef<AnimationQueue | null>(null);

  // Initialize queue
  useEffect(() => {
    queueRef.current = new AnimationQueue(callbacks);
  }, [callbacks]);

  // Update speed when settings change
  useEffect(() => {
    queueRef.current?.setSpeed(settings.speed);
  }, [settings.speed]);

  // Detect changes and queue animations
  useEffect(() => {
    if (!currentState || !queueRef.current) {
      return;
    }

    // Skip animations if disabled or reduced motion with instant transitions
    if (settings.mode === 'DISABLED' || settings.preferReducedMotion) {
      prevStateRef.current = currentState;
      return;
    }

    // Detect changes
    const changes = detectChanges(prevStateRef.current, currentState);
    
    // Filter to only animatable changes
    const animatableChanges = changes.filter(shouldAnimate);

    // Queue animations
    if (animatableChanges.length > 0) {
      queueRef.current.enqueueBatch(animatableChanges);
      
      // Execute queue asynchronously
      void queueRef.current.execute();
    }

    // Update ref for next comparison
    prevStateRef.current = currentState;
  }, [currentState, settings.mode, settings.preferReducedMotion]);

  // Expose queue control methods
  const clearQueue = useCallback(() => {
    queueRef.current?.clear();
  }, []);

  const getQueueSize = useCallback(() => {
    return queueRef.current?.size() ?? 0;
  }, []);

  const isAnimating = useCallback(() => {
    return queueRef.current?.isRunning() ?? false;
  }, []);

  return {
    clearQueue,
    getQueueSize,
    isAnimating,
  };
}
