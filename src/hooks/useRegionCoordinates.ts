/**
 * useRegionCoordinates Hook
 * 
 * Tracks the position and dimensions of visualization regions
 * for path-based animation calculations.
 */

import { useEffect, useState, useCallback, RefObject } from 'react';

/**
 * Region coordinate information
 */
export interface RegionCoords {
  x: number;         // Center X coordinate
  y: number;         // Center Y coordinate
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/**
 * Map of region IDs to their coordinates
 */
export type RegionCoordinatesMap = Map<string, RegionCoords>;

/**
 * Hook to track region coordinates with automatic resize handling
 */
export function useRegionCoordinates(
  regionRefs: Map<string, RefObject<HTMLElement>>
): RegionCoordinatesMap {
  const [coordinates, setCoordinates] = useState<RegionCoordinatesMap>(new Map());

  // Update coordinates for all regions
  const updateCoordinates = useCallback(() => {
    const newCoords = new Map<string, RegionCoords>();

    regionRefs.forEach((ref, id) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        newCoords.set(id, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        });
      }
    });

    setCoordinates(newCoords);
  }, [regionRefs]);

  // Update on mount and when refs change
  useEffect(() => {
    updateCoordinates();
  }, [updateCoordinates]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateCoordinates();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCoordinates]);

  // Handle orientation change (mobile)
  useEffect(() => {
    const handleOrientationChange = () => {
      updateCoordinates();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [updateCoordinates]);

  return coordinates;
}

/**
 * Get coordinates for a specific region
 */
export function getRegionCenter(
  coordinates: RegionCoordinatesMap,
  regionId: string
): { x: number; y: number } | null {
  const coords = coordinates.get(regionId);
  return coords ? { x: coords.x, y: coords.y } : null;
}

/**
 * Calculate distance between two regions
 */
export function calculateDistance(
  coordinates: RegionCoordinatesMap,
  fromRegion: string,
  toRegion: string
): number {
  const from = getRegionCenter(coordinates, fromRegion);
  const to = getRegionCenter(coordinates, toRegion);

  if (!from || !to) return 0;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}
