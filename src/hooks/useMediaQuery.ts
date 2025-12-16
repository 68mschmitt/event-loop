import { useState, useEffect } from 'react';

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

type MediaQueryBreakpoint = keyof typeof breakpoints;

interface MediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

export function useMediaQuery(
  query: string | MediaQueryBreakpoint,
  options: MediaQueryOptions = {}
): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  // Resolve breakpoint to media query string
  const mediaQuery = query in breakpoints ? breakpoints[query as MediaQueryBreakpoint] : query;

  const getMatches = (query: string): boolean => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(mediaQuery);
    }
    return defaultValue;
  });

  useEffect(() => {
    const matchMedia = window.matchMedia(mediaQuery);

    const handleChange = () => {
      setMatches(getMatches(mediaQuery));
    };

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Add event listener for media query changes
    matchMedia.addEventListener('change', handleChange);

    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [mediaQuery, defaultValue]);

  return matches;
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => !useMediaQuery('md'); // < 768px
export const useIsTablet = () => useMediaQuery('md') && !useMediaQuery('lg'); // 768px - 1023px
export const useIsDesktop = () => useMediaQuery('lg'); // >= 1024px
