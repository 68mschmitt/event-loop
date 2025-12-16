/**
 * Timeline Scrubber Hook
 * 
 * Manages drag/click interactions for timeline navigation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getStepFromPosition } from '@/utils/timelineHelpers';

interface UseTimelineScrubberOptions {
  totalSteps: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
}

/**
 * Hook for timeline scrubber drag interactions
 */
export function useTimelineScrubber({
  totalSteps,
  onStepChange,
  disabled = false,
}: UseTimelineScrubberOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  /**
   * Get step from mouse/touch position
   */
  const getStepFromEvent = useCallback((clientX: number): number | null => {
    if (!timelineRef.current) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    return getStepFromPosition(clientX, rect, totalSteps);
  }, [totalSteps]);
  
  /**
   * Handle mouse down (start dragging)
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const step = getStepFromEvent(e.clientX);
    if (step !== null) {
      onStepChange(step);
    }
  }, [disabled, getStepFromEvent, onStepChange]);
  
  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    
    const touch = e.touches[0];
    if (touch) {
      const step = getStepFromEvent(touch.clientX);
      if (step !== null) {
        onStepChange(step);
      }
    }
  }, [disabled, getStepFromEvent, onStepChange]);
  
  /**
   * Handle mouse move (dragging)
   */
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const step = getStepFromEvent(e.clientX);
      if (step !== null) {
        onStepChange(step);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const step = getStepFromEvent(touch.clientX);
        if (step !== null) {
          onStepChange(step);
        }
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, getStepFromEvent, onStepChange]);
  
  return {
    timelineRef,
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}
