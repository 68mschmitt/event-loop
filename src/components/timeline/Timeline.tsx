/**
 * Timeline Component
 * 
 * Interactive timeline visualization with scrubber for navigation.
 */

import { useSimulatorState, useSimulatorDispatch } from '@/state/SimulatorContext';
import { useTimelineScrubber } from '@/hooks/useTimelineScrubber';
import { extractTimelineEvents, getPositionFromStep, formatStepLabel } from '@/utils/timelineHelpers';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Timeline with scrubber and event markers
 */
export function Timeline() {
  const state = useSimulatorState();
  const dispatch = useSimulatorDispatch();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  
  const history = state.history;
  const totalSteps = history.length;
  const currentStep = history.length - 1;
  
  const events = extractTimelineEvents(history);
  
  /**
   * Handle step change from scrubber
   */
  const handleStepChange = (step: number) => {
    dispatch({ type: 'JUMP_TO_STEP', payload: { stepIndex: step } });
  };
  
  const {
    timelineRef,
    isDragging,
    handleMouseDown,
    handleTouchStart,
  } = useTimelineScrubber({
    totalSteps,
    onStepChange: handleStepChange,
    disabled: totalSteps === 0,
  });
  
  /**
   * Handle mouse move for hover preview
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const step = Math.floor(percentage * (totalSteps - 1));
    
    setHoveredStep(step);
  };
  
  const handleMouseLeave = () => {
    setHoveredStep(null);
  };
  
  // Calculate scrubber position
  const scrubberPosition = totalSteps > 1 
    ? getPositionFromStep(currentStep, 100, totalSteps) 
    : 0;
  
  if (totalSteps === 0) {
    return (
      <div className="h-20 px-6 flex items-center justify-center bg-zinc-900 border-t border-zinc-800">
        <p className="text-zinc-500 text-sm">No steps in history yet. Start simulation to see timeline.</p>
      </div>
    );
  }
  
  return (
    <div className="h-20 px-6 flex items-center bg-zinc-900 border-t border-zinc-800">
      <div className="flex-1 relative">
        {/* Timeline track */}
        <div
          ref={timelineRef}
          className={cn(
            'relative h-12 bg-zinc-800 rounded-lg cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isDragging && 'cursor-grabbing'
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="slider"
          aria-label="Timeline scrubber"
          aria-valuemin={0}
          aria-valuemax={totalSteps - 1}
          aria-valuenow={currentStep}
          aria-valuetext={formatStepLabel(currentStep, totalSteps)}
          tabIndex={0}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-blue-600/20 rounded-lg transition-all"
            style={{ width: `${scrubberPosition}%` }}
          />
          
          {/* Event markers */}
          <div className="absolute inset-0">
            {events.map((event, i) => {
              const position = getPositionFromStep(event.stepIndex, 100, totalSteps);
              return (
                <div
                  key={`${event.stepIndex}-${event.type}-${i}`}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full',
                    event.color,
                    'opacity-60'
                  )}
                  style={{ left: `${position}%` }}
                  title={event.label}
                />
              );
            })}
          </div>
          
          {/* Scrubber handle */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
              'w-4 h-8 bg-blue-500 rounded-full',
              'border-2 border-white shadow-lg',
              'transition-all',
              isDragging && 'scale-110'
            )}
            style={{ left: `${scrubberPosition}%` }}
          />
          
          {/* Hover tooltip */}
          {hoveredStep !== null && !isDragging && (
            <div
              className="absolute -top-10 -translate-x-1/2 px-3 py-1.5 bg-zinc-700 text-white text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap"
              style={{ 
                left: `${getPositionFromStep(hoveredStep, 100, totalSteps)}%` 
              }}
            >
              {formatStepLabel(hoveredStep, totalSteps)}
            </div>
          )}
        </div>
        
        {/* Step labels */}
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>Step 1</span>
          <span className="text-zinc-400 font-medium">
            {formatStepLabel(currentStep, totalSteps)}
          </span>
          <span>Step {totalSteps}</span>
        </div>
      </div>
    </div>
  );
}
