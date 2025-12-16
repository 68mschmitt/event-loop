import { useEffect, RefObject } from 'react';

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  isActive: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusOnDeactivate?: boolean;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  options: FocusTrapOptions
): void {
  const { isActive, initialFocusRef, returnFocusOnDeactivate = true } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that triggered the modal
    const previousActiveElement = document.activeElement as HTMLElement;

    // Get all focusable elements inside container
    const getFocusableElements = (): HTMLElement[] => {
      if (!containerRef.current) return [];
      return Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS)
      );
    };

    // Focus initial element or first focusable element
    const focusInitialElement = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0]?.focus();
        }
      }
    };

    // Trap focus on Tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      // Shift+Tab on first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Focus initial element
    focusInitialElement();

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove listener and return focus
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (returnFocusOnDeactivate && previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isActive, containerRef, initialFocusRef, returnFocusOnDeactivate]);
}
