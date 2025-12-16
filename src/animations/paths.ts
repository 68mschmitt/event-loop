/**
 * Path Generation Utilities
 * 
 * Generates SVG paths for smooth task movement animations between regions.
 */

import type { RegionCoordinatesMap } from '../hooks/useRegionCoordinates';
import { PATH_CONFIG } from './config';

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bezier curve control points
 */
export interface BezierPath {
  start: Point;
  end: Point;
  controlPoint1: Point;
  controlPoint2: Point;
}

/**
 * Path cache for memoization
 */
class PathCache {
  private cache = new Map<string, BezierPath>();
  private maxSize: number;

  constructor(maxSize = PATH_CONFIG.CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  get(key: string): BezierPath | undefined {
    return this.cache.get(key);
  }

  set(key: string, path: BezierPath): void {
    // Simple LRU: remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, path);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global path cache instance
const pathCache = new PathCache();

/**
 * Generate cache key for a path
 */
function getCacheKey(from: Point, to: Point): string {
  return `${from.x.toFixed(0)},${from.y.toFixed(0)}-${to.x.toFixed(0)},${to.y.toFixed(0)}`;
}

/**
 * Calculate control points for a smooth bezier curve
 */
function calculateControlPoints(start: Point, end: Point): { cp1: Point; cp2: Point } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Offset perpendicular to the line for natural curves
  const offset = distance * PATH_CONFIG.CURVE_OFFSET;
  
  // Calculate perpendicular vector
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Control point 1: offset from start
  const cp1: Point = {
    x: start.x + dx * 0.25 + perpX * offset,
    y: start.y + dy * 0.25 + perpY * offset,
  };

  // Control point 2: offset from end
  const cp2: Point = {
    x: start.x + dx * 0.75 + perpX * offset,
    y: start.y + dy * 0.75 + perpY * offset,
  };

  return { cp1, cp2 };
}

/**
 * Generate bezier path between two points
 */
export function generateBezierPath(start: Point, end: Point): BezierPath {
  const cacheKey = getCacheKey(start, end);
  const cached = pathCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const { cp1, cp2 } = calculateControlPoints(start, end);
  
  const path: BezierPath = {
    start,
    end,
    controlPoint1: cp1,
    controlPoint2: cp2,
  };

  pathCache.set(cacheKey, path);
  return path;
}

/**
 * Generate path between two regions
 */
export function generateRegionPath(
  coordinates: RegionCoordinatesMap,
  fromRegion: string,
  toRegion: string
): BezierPath | null {
  const from = coordinates.get(fromRegion);
  const to = coordinates.get(toRegion);

  if (!from || !to) {
    return null;
  }

  return generateBezierPath(
    { x: from.x, y: from.y },
    { x: to.x, y: to.y }
  );
}

/**
 * Convert bezier path to SVG path string
 */
export function pathToSVG(path: BezierPath): string {
  return `M ${path.start.x} ${path.start.y} C ${path.controlPoint1.x} ${path.controlPoint1.y}, ${path.controlPoint2.x} ${path.controlPoint2.y}, ${path.end.x} ${path.end.y}`;
}

/**
 * Calculate point along bezier curve at time t (0 to 1)
 */
export function getPointOnBezier(path: BezierPath, t: number): Point {
  const t1 = 1 - t;
  const t2 = t1 * t1;
  const t3 = t2 * t1;
  const t4 = t * t;
  const t5 = t4 * t;

  return {
    x: t3 * path.start.x +
       3 * t2 * t * path.controlPoint1.x +
       3 * t1 * t4 * path.controlPoint2.x +
       t5 * path.end.x,
    y: t3 * path.start.y +
       3 * t2 * t * path.controlPoint1.y +
       3 * t1 * t4 * path.controlPoint2.y +
       t5 * path.end.y,
  };
}

/**
 * Get rotation angle for element moving along path
 */
export function getPathRotation(path: BezierPath, t: number): number {
  // Sample two nearby points to calculate tangent
  const t1 = Math.max(0, t - 0.01);
  const t2 = Math.min(1, t + 0.01);
  
  const p1 = getPointOnBezier(path, t1);
  const p2 = getPointOnBezier(path, t2);
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Clear the path cache (useful for testing or memory management)
 */
export function clearPathCache(): void {
  pathCache.clear();
}

/**
 * Validate that a region exists in coordinates map
 */
export function validateRegion(
  coordinates: RegionCoordinatesMap,
  regionId: string
): boolean {
  return coordinates.has(regionId);
}

/**
 * Get all available region IDs
 */
export function getAvailableRegions(coordinates: RegionCoordinatesMap): string[] {
  return Array.from(coordinates.keys());
}
