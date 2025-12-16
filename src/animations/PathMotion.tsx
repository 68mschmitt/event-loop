/**
 * PathMotion Component (Optional)
 * 
 * Component for animating elements along SVG paths.
 * This is an alternative to layoutId-based position animations.
 */

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import type { BezierPath } from './paths';
import { getPointOnBezier } from './paths';

interface PathMotionProps {
  path: BezierPath;
  duration?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

/**
 * Animate element along a bezier path
 * Note: This is an alternative approach to layoutId animations
 */
export function PathMotion({ 
  path, 
  duration = 0.6, 
  onComplete,
  children 
}: PathMotionProps) {
  const progress = useMotionValue(0);
  
  // Transform progress (0-1) to X coordinate
  const x = useTransform(progress, (t) => {
    const point = getPointOnBezier(path, t);
    return point.x;
  });
  
  // Transform progress (0-1) to Y coordinate
  const y = useTransform(progress, (t) => {
    const point = getPointOnBezier(path, t);
    return point.y;
  });

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration,
      ease: 'easeInOut',
    });

    if (onComplete) {
      controls.then(onComplete);
    }

    return () => controls.stop();
  }, [progress, duration, onComplete]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Show SVG path for debugging
 */
interface PathDebuggerProps {
  path: BezierPath;
  color?: string;
}

export function PathDebugger({ path, color = 'rgba(255, 0, 0, 0.5)' }: PathDebuggerProps) {
  const pathString = `M ${path.start.x} ${path.start.y} C ${path.controlPoint1.x} ${path.controlPoint1.y}, ${path.controlPoint2.x} ${path.controlPoint2.y}, ${path.end.x} ${path.end.y}`;

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <path
        d={pathString}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      {/* Start point */}
      <circle cx={path.start.x} cy={path.start.y} r="4" fill="green" />
      {/* End point */}
      <circle cx={path.end.x} cy={path.end.y} r="4" fill="red" />
      {/* Control points */}
      <circle cx={path.controlPoint1.x} cy={path.controlPoint1.y} r="3" fill="blue" opacity="0.5" />
      <circle cx={path.controlPoint2.x} cy={path.controlPoint2.y} r="3" fill="blue" opacity="0.5" />
    </svg>
  );
}
