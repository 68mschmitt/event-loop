/**
 * Animation Configuration
 * 
 * Centralized animation timing constants and easing functions.
 */

/**
 * Base animation durations (in milliseconds)
 * These will be divided by speed multiplier
 */
export const ANIMATION_DURATIONS = {
  // Task movements between regions
  TASK_MOVE: 600,
  
  // Task state transitions
  TASK_STATE_CHANGE: 300,
  
  // Task creation/deletion
  TASK_CREATE: 400,
  TASK_REMOVE: 300,
  
  // Stack operations
  STACK_PUSH: 400,
  STACK_POP: 350,
  
  // Tick boundaries
  TICK_START: 200,
  TICK_END: 200,
  
  // Console output
  CONSOLE_LOG: 300,
  
  // Stagger between multiple simultaneous animations
  STAGGER: 80,
} as const;

/**
 * Animation delays (in milliseconds)
 */
export const ANIMATION_DELAYS = {
  // Delay before starting next animation in sequence
  SEQUENTIAL: 100,
  
  // Delay for related animations (e.g., moving multiple tasks)
  BATCH: 50,
  
  // No delay
  IMMEDIATE: 0,
} as const;

/**
 * Animation priorities (0-10, higher = executes first)
 */
export const ANIMATION_PRIORITIES = {
  TICK_BOUNDARY: 10,    // Highest - tick start/end
  STACK_OPERATION: 8,   // Stack push/pop
  TASK_MOVE: 6,         // Task moving between queues
  TASK_STATE: 4,        // Task state changes
  TASK_CREATE: 3,       // Task creation
  CONSOLE_LOG: 2,       // Console output
  TASK_REMOVE: 1,       // Lowest - task removal
} as const;

/**
 * Easing functions for different animation types
 */
export const EASING = {
  // Movement between regions - smooth and natural
  MOVE: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
  
  // State changes - quick and snappy
  STATE: [0.4, 0.0, 0.6, 1] as [number, number, number, number],
  
  // Entrance animations - bouncy
  ENTER: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
  
  // Exit animations - quick
  EXIT: [0.4, 0.0, 1, 1] as [number, number, number, number],
  
  // Spring physics
  SPRING: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  
  // Gentle spring
  SPRING_GENTLE: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // Target FPS
  TARGET_FPS: 60,
  
  // Minimum acceptable FPS before switching to REDUCED mode
  MIN_FPS: 30,
  
  // Critical FPS threshold - switch to DISABLED mode
  CRITICAL_FPS: 15,
  
  // Number of tasks before auto-switching to REDUCED mode
  MAX_TASKS_FULL: 50,
  
  // Number of tasks before auto-switching to DISABLED mode
  MAX_TASKS_REDUCED: 100,
  
  // Number of frames to average for FPS calculation
  FPS_SAMPLE_SIZE: 60,
  
  // Maximum dropped frames before degrading performance
  MAX_DROPPED_FRAMES: 10,
} as const;

/**
 * Path animation configuration
 */
export const PATH_CONFIG = {
  // Bezier curve control point offset (percentage of distance)
  CURVE_OFFSET: 0.3,
  
  // Minimum curve radius to prevent sharp turns
  MIN_CURVE_RADIUS: 20,
  
  // Path smoothing iterations
  SMOOTH_ITERATIONS: 2,
  
  // Path cache size (number of paths to memoize)
  CACHE_SIZE: 100,
} as const;

/**
 * GPU-accelerated transform properties
 * Always use these instead of left/top/width/height
 */
export const GPU_PROPS = [
  'transform',
  'opacity',
  'filter',
] as const;

/**
 * Speed multiplier bounds
 */
export const SPEED_LIMITS = {
  MIN: 0.25,
  MAX: 4,
  DEFAULT: 1,
} as const;

/**
 * Calculate effective duration based on speed multiplier
 */
export function getEffectiveDuration(
  baseDuration: number,
  speedMultiplier: number
): number {
  return baseDuration / Math.max(SPEED_LIMITS.MIN, Math.min(SPEED_LIMITS.MAX, speedMultiplier));
}

/**
 * Get transition config for reduced motion
 */
export function getReducedMotionTransition() {
  return {
    duration: 0,
    delay: 0,
  };
}
