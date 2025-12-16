/**
 * Framer Motion Variants for Task Animations
 * 
 * Defines animation variants for different task states and transitions.
 */

import type { Variants } from 'framer-motion';
import { EASING } from './config';

/**
 * Task node variants for state-based animations
 */
export const taskNodeVariants: Variants = {
  // Initial state - hidden
  hidden: {
    opacity: 0,
    scale: 0.8,
  },

  // Task is queued (waiting)
  queued: {
    opacity: 1,
    scale: 1,
    backgroundColor: 'var(--color-task-queued)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  // Task is running (executing)
  running: {
    opacity: 1,
    scale: 1.05,
    backgroundColor: 'var(--color-task-running)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },

  // Task completed
  completed: {
    opacity: 0.7,
    scale: 0.95,
    backgroundColor: 'var(--color-task-completed)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },

  // Task has error
  error: {
    opacity: 1,
    scale: 1,
    backgroundColor: 'var(--color-task-error)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
};

/**
 * Hover variants for task nodes
 */
export const taskHoverVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Pulse animation for running tasks
 */
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Entrance animation for new tasks
 */
export const entranceVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.5,
    y: -20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Exit animation for removed tasks
 */
export const exitVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.3,
      ease: EASING.EXIT,
    },
  },
};

/**
 * Badge variants for task indicators
 */
export const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
};

/**
 * Stagger children animation
 */
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Queue item variants
 */
export const queueItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Path movement transition
 */
export const pathTransition = {
  duration: 0.6,
  ease: EASING.MOVE,
};

/**
 * State change transition
 */
export const stateTransition = {
  duration: 0.3,
  ease: EASING.STATE,
};
