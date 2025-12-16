import { useRef, useEffect, RefObject } from 'react';

export function useFocusReturn(): RefObject<HTMLElement | null> {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the currently focused element when component mounts
    triggerRef.current = document.activeElement as HTMLElement;

    // Return focus when component unmounts
    return () => {
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, []);

  return triggerRef;
}
