import { useCallback, useRef } from 'react';

interface AriaLiveOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
  atomic?: boolean;
}

export function useAriaLive() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Create live region if it doesn't exist
  const ensureLiveRegion = useCallback((politeness: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
      liveRegionRef.current = region;
    }
    return liveRegionRef.current;
  }, []);

  const announce = useCallback(
    (message: string, options: AriaLiveOptions = {}) => {
      const {
        politeness = 'polite',
        clearAfter = 5000,
        atomic = true,
      } = options;

      const region = ensureLiveRegion(politeness);
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', atomic.toString());

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the message
      region.textContent = message;

      // Clear after specified time
      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          if (region) {
            region.textContent = '';
          }
        }, clearAfter);
      }
    },
    [ensureLiveRegion]
  );

  const clear = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { announce, clear };
}
