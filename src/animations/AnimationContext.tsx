/**
 * Animation Context
 * 
 * Provides global animation settings and controls.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AnimationSettings, AnimationMode, AnimationMetrics } from './types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { SPEED_LIMITS, PERFORMANCE_THRESHOLDS } from './config';

/**
 * Animation context value
 */
interface AnimationContextValue {
  settings: AnimationSettings;
  metrics: AnimationMetrics;
  updateSettings: (updates: Partial<AnimationSettings>) => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: AnimationMode) => void;
  toggleAutoPerformance: () => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

/**
 * Animation provider props
 */
interface AnimationProviderProps {
  children: ReactNode;
  initialSpeed?: number;
  initialMode?: AnimationMode;
}

/**
 * Animation settings provider
 */
export function AnimationProvider({ 
  children,
  initialSpeed = SPEED_LIMITS.DEFAULT,
  initialMode = 'FULL'
}: AnimationProviderProps) {
  const preferReducedMotion = useReducedMotion();

  const [settings, setSettings] = useState<AnimationSettings>({
    mode: initialMode,
    speed: initialSpeed,
    preferReducedMotion,
    autoAdjustPerformance: true,
  });

  const [metrics, _setMetrics] = useState<AnimationMetrics>({
    fps: PERFORMANCE_THRESHOLDS.TARGET_FPS,
    activeAnimations: 0,
    queuedAnimations: 0,
    droppedFrames: 0,
    lastFrameTime: 0,
  });

  // Update reduced motion preference when it changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferReducedMotion,
    }));
  }, [preferReducedMotion]);

  const updateSettings = (updates: Partial<AnimationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const setSpeed = (speed: number) => {
    const clampedSpeed = Math.max(
      SPEED_LIMITS.MIN,
      Math.min(SPEED_LIMITS.MAX, speed)
    );
    updateSettings({ speed: clampedSpeed });
  };

  const setMode = (mode: AnimationMode) => {
    updateSettings({ mode });
  };

  const toggleAutoPerformance = () => {
    updateSettings({ autoAdjustPerformance: !settings.autoAdjustPerformance });
  };

  const value: AnimationContextValue = {
    settings,
    metrics,
    updateSettings,
    setSpeed,
    setMode,
    toggleAutoPerformance,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

/**
 * Hook to access animation context
 */
export function useAnimationContext(): AnimationContextValue {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationContext must be used within AnimationProvider');
  }
  return context;
}

/**
 * Hook to get only animation settings
 */
export function useAnimationSettings(): AnimationSettings {
  const { settings } = useAnimationContext();
  return settings;
}

/**
 * Hook to get only animation metrics
 */
export function useAnimationMetrics(): AnimationMetrics {
  const { metrics } = useAnimationContext();
  return metrics;
}
