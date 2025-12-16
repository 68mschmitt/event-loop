# Session 7.1: Keyboard Navigation and Focus Management

## Overview

This session implements comprehensive keyboard navigation throughout the Event Loop Visualizer. You'll establish logical tab order, add keyboard shortcuts for common actions, implement focus traps for modal dialogs, and ensure all interactive elements have visible focus indicators using Tailwind's focus utilities.

## Prerequisites

- Phase 5 complete (playback controls exist)
- Phase 6 complete (task inspector modal exists)
- Understanding of keyboard event handling in React
- Familiarity with Tailwind focus utilities
- Basic understanding of focus management

## Goals

- [ ] Establish logical tab order across all interactive elements
- [ ] Implement keyboard shortcuts (Space, Arrow keys, Escape)
- [ ] Add focus trap to Task Inspector modal
- [ ] Ensure focus returns to trigger element when modal closes
- [ ] Add visible focus indicators to all interactive elements
- [ ] Create `useKeyboardShortcut` custom hook
- [ ] Create `useFocusTrap` custom hook
- [ ] Add focus indicators with Tailwind utilities
- [ ] Test keyboard navigation flow
- [ ] Document keyboard shortcuts for users

## Files to Create/Modify

### `src/hooks/useKeyboardShortcut.ts`
**Purpose:** Custom hook for registering keyboard shortcuts
**Exports:** `useKeyboardShortcut` hook
**Key responsibilities:**
- Listen for keyboard events
- Match key combinations
- Execute callback when shortcut pressed
- Clean up event listeners

### `src/hooks/useFocusTrap.ts`
**Purpose:** Custom hook for trapping focus inside modal dialogs
**Exports:** `useFocusTrap` hook
**Key responsibilities:**
- Get all focusable elements within container
- Trap Tab key navigation inside container
- Handle Shift+Tab for backward navigation
- Return focus to trigger element on close

### `src/hooks/useFocusReturn.ts`
**Purpose:** Custom hook for returning focus to trigger element
**Exports:** `useFocusReturn` hook
**Key responsibilities:**
- Store reference to trigger element
- Return focus when component unmounts

### `src/components/controls/PlaybackControls.tsx` (modify)
**Purpose:** Add keyboard shortcuts to playback controls
**Changes:**
- Add Space key for play/pause
- Add Arrow keys for step forward/back
- Add visible focus indicators

### `src/components/panels/TaskInspector.tsx` (modify)
**Purpose:** Add focus trap to modal
**Changes:**
- Implement focus trap when modal opens
- Handle Escape key to close
- Return focus to trigger element

### `src/components/timeline/TimelineScrubber.tsx` (modify)
**Purpose:** Add keyboard control to timeline
**Changes:**
- Arrow keys to scrub timeline
- Home/End keys to jump to start/end

### `src/components/common/Button.tsx` (modify)
**Purpose:** Add consistent focus styling
**Changes:**
- Add Tailwind focus utilities
- Ensure Enter and Space activate

### `src/components/layout/Toolbar.tsx` (modify)
**Purpose:** Add skip link for keyboard users
**Changes:**
- Add "Skip to main content" link at top
- Hidden visually, visible on focus

## Type Definitions

### useKeyboardShortcut Hook

```typescript
interface KeyboardShortcutOptions {
  key: string;                    // Key to listen for (e.g., ' ', 'Escape', 'ArrowLeft')
  ctrlKey?: boolean;              // Whether Ctrl must be pressed
  shiftKey?: boolean;             // Whether Shift must be pressed
  altKey?: boolean;               // Whether Alt must be pressed
  metaKey?: boolean;              // Whether Cmd/Win must be pressed
  preventDefault?: boolean;       // Whether to prevent default behavior
  enabled?: boolean;              // Whether shortcut is currently enabled
}

type UseKeyboardShortcut = (
  options: KeyboardShortcutOptions,
  callback: (event: KeyboardEvent) => void
) => void;
```

### useFocusTrap Hook

```typescript
interface FocusTrapOptions {
  isActive: boolean;              // Whether trap is currently active
  initialFocusRef?: RefObject<HTMLElement>; // Element to focus initially
  returnFocusOnDeactivate?: boolean; // Whether to return focus on unmount
}

type UseFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  options: FocusTrapOptions
) => void;
```

### useFocusReturn Hook

```typescript
type UseFocusReturn = () => RefObject<HTMLElement>;
```

### Focusable Elements Query

```typescript
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
```

## Implementation Specifications

### useKeyboardShortcut Hook

```typescript
// src/hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: (event: KeyboardEvent) => void
): void {
  const {
    key,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    preventDefault = true,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if modifier keys match
      const modifiersMatch =
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey;

      // Check if key matches (case-insensitive for letters)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, shiftKey, altKey, metaKey, preventDefault, enabled, callback]);
}
```

### useFocusTrap Hook

```typescript
// src/hooks/useFocusTrap.ts
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
```

### useFocusReturn Hook

```typescript
// src/hooks/useFocusReturn.ts
import { useRef, useEffect, RefObject } from 'react';

export function useFocusReturn(): RefObject<HTMLElement> {
  const triggerRef = useRef<HTMLElement>(null);

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
```

### PlaybackControls with Keyboard Shortcuts

```typescript
// src/components/controls/PlaybackControls.tsx (modifications)
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function PlaybackControls() {
  const { state, dispatch } = useSimulator();

  // Space key: Toggle play/pause
  useKeyboardShortcut(
    { key: ' ', preventDefault: true },
    () => {
      if (state.playbackState === 'playing') {
        dispatch({ type: 'PAUSE' });
      } else {
        dispatch({ type: 'PLAY' });
      }
    }
  );

  // Arrow Right: Step forward
  useKeyboardShortcut(
    { key: 'ArrowRight', preventDefault: true },
    () => {
      if (state.playbackState !== 'playing') {
        dispatch({ type: 'STEP_FORWARD' });
      }
    }
  );

  // Arrow Left: Step backward
  useKeyboardShortcut(
    { key: 'ArrowLeft', preventDefault: true },
    () => {
      if (state.playbackState !== 'playing') {
        dispatch({ type: 'STEP_BACKWARD' });
      }
    }
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleStepBack}
        disabled={!canStepBack}
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
        aria-label="Step backward"
      >
        <StepBackIcon />
      </button>

      <button
        onClick={handlePlayPause}
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button
        onClick={handleStepForward}
        disabled={!canStepForward}
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
        aria-label="Step forward"
      >
        <StepForwardIcon />
      </button>
    </div>
  );
}
```

### Task Inspector with Focus Trap

```typescript
// src/components/panels/TaskInspector.tsx (modifications)
import { useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function TaskInspector({ task, onClose }: TaskInspectorProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Trap focus inside dialog
  useFocusTrap(dialogRef, {
    isActive: true,
    initialFocusRef: closeButtonRef,
    returnFocusOnDeactivate: true,
  });

  // Escape key: Close dialog
  useKeyboardShortcut(
    { key: 'Escape', preventDefault: true },
    () => {
      onClose();
    }
  );

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          ref={dialogRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full p-6 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">
              Task Details
            </Dialog.Title>
            <Dialog.Close
              ref={closeButtonRef}
              className="p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close dialog"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          {/* Task content */}
          <div className="space-y-4">
            {/* ... task details ... */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Timeline Scrubber with Keyboard Controls

```typescript
// src/components/timeline/TimelineScrubber.tsx (modifications)
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function TimelineScrubber() {
  const { state, dispatch } = useSimulator();
  const currentStep = state.stepIndex;
  const totalSteps = state.history.length;

  // Arrow keys: Scrub timeline
  useKeyboardShortcut(
    { key: 'ArrowLeft', preventDefault: true },
    () => {
      if (currentStep > 0) {
        dispatch({ type: 'JUMP_TO_STEP', payload: currentStep - 1 });
      }
    }
  );

  useKeyboardShortcut(
    { key: 'ArrowRight', preventDefault: true },
    () => {
      if (currentStep < totalSteps - 1) {
        dispatch({ type: 'JUMP_TO_STEP', payload: currentStep + 1 });
      }
    }
  );

  // Home: Jump to start
  useKeyboardShortcut(
    { key: 'Home', preventDefault: true },
    () => {
      dispatch({ type: 'JUMP_TO_STEP', payload: 0 });
    }
  );

  // End: Jump to end
  useKeyboardShortcut(
    { key: 'End', preventDefault: true },
    () => {
      dispatch({ type: 'JUMP_TO_STEP', payload: totalSteps - 1 });
    }
  );

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-zinc-400">
        Step {currentStep + 1} of {totalSteps}
      </span>
      
      <Slider.Root
        className="relative flex items-center flex-1 h-5"
        value={[currentStep]}
        max={totalSteps - 1}
        step={1}
        onValueChange={([value]) => {
          dispatch({ type: 'JUMP_TO_STEP', payload: value });
        }}
      >
        <Slider.Track className="relative flex-1 h-1 bg-zinc-700 rounded">
          <Slider.Range className="absolute h-full bg-blue-500 rounded" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Timeline position"
        />
      </Slider.Root>
    </div>
  );
}
```

### Button Component with Focus Styling

```typescript
// src/components/common/Button.tsx (modifications)
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/classNames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseStyles = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white focus:ring-zinc-500',
      ghost: 'hover:bg-zinc-800 text-zinc-300 focus:ring-zinc-600',
    };
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Skip Link in Toolbar

```typescript
// src/components/layout/Toolbar.tsx (modifications)
export function Toolbar() {
  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <div className="h-16 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
        {/* ... existing toolbar content ... */}
      </div>
    </>
  );
}

// src/components/layout/Canvas.tsx (modifications)
export function Canvas() {
  return (
    <div id="main-content" className="h-full p-6" tabIndex={-1}>
      {/* Existing canvas content */}
    </div>
  );
}
```

### Keyboard Shortcuts Documentation Component

```typescript
// src/components/common/KeyboardShortcutsHelp.tsx
import * as Dialog from '@radix-ui/react-dialog';

interface ShortcutItem {
  keys: string;
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: 'Space', description: 'Play/Pause simulation' },
  { keys: '→', description: 'Step forward' },
  { keys: '←', description: 'Step backward' },
  { keys: 'Home', description: 'Jump to start' },
  { keys: 'End', description: 'Jump to end' },
  { keys: 'Esc', description: 'Close dialog' },
  { keys: 'Tab', description: 'Navigate forward' },
  { keys: 'Shift+Tab', description: 'Navigate backward' },
];

export function KeyboardShortcutsHelp() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="p-2 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="View keyboard shortcuts"
        >
          <KeyboardIcon />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 focus:outline-none">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Keyboard Shortcuts
          </Dialog.Title>

          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center justify-between">
                <span className="text-zinc-400">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>

          <Dialog.Close asChild>
            <button className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Success Criteria

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order flows logically through the interface
- [ ] Space key toggles play/pause
- [ ] Arrow keys step through simulation
- [ ] Arrow keys also scrub timeline when timeline focused
- [ ] Home/End keys jump to start/end of timeline
- [ ] Escape key closes Task Inspector modal
- [ ] Focus is trapped inside Task Inspector when open
- [ ] Focus returns to trigger button when modal closes
- [ ] All buttons have visible focus indicators (2px ring, blue)
- [ ] Focus indicators have sufficient contrast (3:1 minimum)
- [ ] Skip link appears at top when focused
- [ ] No keyboard traps (can always Tab out)
- [ ] Custom hooks are reusable and well-typed
- [ ] Keyboard shortcuts documented in help dialog

## Test Specifications

### Test: Keyboard shortcut registration

```typescript
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { fireEvent } from '@testing-library/react';

test('calls callback when shortcut pressed', () => {
  const callback = vi.fn();
  
  renderHook(() =>
    useKeyboardShortcut({ key: ' ' }, callback)
  );

  fireEvent.keyDown(window, { key: ' ' });
  expect(callback).toHaveBeenCalledTimes(1);
});

test('respects modifier keys', () => {
  const callback = vi.fn();
  
  renderHook(() =>
    useKeyboardShortcut({ key: 's', ctrlKey: true }, callback)
  );

  fireEvent.keyDown(window, { key: 's' });
  expect(callback).not.toHaveBeenCalled();

  fireEvent.keyDown(window, { key: 's', ctrlKey: true });
  expect(callback).toHaveBeenCalledTimes(1);
});

test('can be disabled', () => {
  const callback = vi.fn();
  
  renderHook(() =>
    useKeyboardShortcut({ key: ' ', enabled: false }, callback)
  );

  fireEvent.keyDown(window, { key: ' ' });
  expect(callback).not.toHaveBeenCalled();
});
```

### Test: Focus trap

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInspector } from '@/components/panels/TaskInspector';

test('traps focus inside modal', async () => {
  const user = userEvent.setup();
  
  render(<TaskInspector task={mockTask} onClose={vi.fn()} />);

  const closeButton = screen.getByLabelText('Close dialog');
  const firstInput = screen.getAllByRole('button')[0];
  
  // Focus should start on close button
  expect(closeButton).toHaveFocus();

  // Tab to first element
  await user.tab();
  expect(firstInput).toHaveFocus();

  // Keep tabbing until we cycle back
  await user.tab(); // ... more tabs ...
  expect(closeButton).toHaveFocus(); // Should cycle back
});

test('returns focus to trigger on close', async () => {
  const user = userEvent.setup();
  const { unmount } = render(
    <>
      <button>Trigger</button>
      <TaskInspector task={mockTask} onClose={vi.fn()} />
    </>
  );

  const trigger = screen.getByText('Trigger');
  trigger.focus();

  // Modal steals focus
  expect(trigger).not.toHaveFocus();

  // Close modal
  unmount();

  // Focus should return
  expect(trigger).toHaveFocus();
});
```

### Test: Playback keyboard shortcuts

```typescript
test('Space key toggles play/pause', async () => {
  const user = userEvent.setup();
  render(<App />);

  const playButton = screen.getByLabelText('Play simulation');
  
  // Press Space
  await user.keyboard(' ');
  
  expect(playButton).toHaveAttribute('aria-pressed', 'true');

  // Press Space again
  await user.keyboard(' ');
  
  expect(playButton).toHaveAttribute('aria-pressed', 'false');
});

test('Arrow keys step through simulation', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Load a preset first
  // ...

  const stepDisplay = screen.getByText(/Step: 0/);

  await user.keyboard('{ArrowRight}');
  expect(screen.getByText(/Step: 1/)).toBeInTheDocument();

  await user.keyboard('{ArrowRight}');
  expect(screen.getByText(/Step: 2/)).toBeInTheDocument();

  await user.keyboard('{ArrowLeft}');
  expect(screen.getByText(/Step: 1/)).toBeInTheDocument();
});
```

### Test: Focus indicators visible

```typescript
test('focus indicators have sufficient contrast', () => {
  const { container } = render(<Button>Click me</Button>);
  const button = container.querySelector('button');

  button?.focus();

  const styles = window.getComputedStyle(button!);
  // Check for outline or box-shadow (focus ring)
  expect(
    styles.outline !== 'none' || styles.boxShadow !== 'none'
  ).toBe(true);
});
```

### E2E Test: Complete keyboard flow

```typescript
import { test, expect } from '@playwright/test';

test('can navigate entire app with keyboard', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Tab to skip link
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to main content');

  // Activate skip link
  await page.keyboard.press('Enter');

  // Should jump to main content
  await expect(page.locator('#main-content')).toBeFocused();

  // Tab to play button
  await page.keyboard.press('Tab');
  await expect(page.locator('[aria-label="Play simulation"]')).toBeFocused();

  // Press Space to play
  await page.keyboard.press('Space');
  await expect(page.locator('[aria-label="Pause simulation"]')).toBeVisible();

  // Press Space to pause
  await page.keyboard.press('Space');
  await expect(page.locator('[aria-label="Play simulation"]')).toBeVisible();

  // Press Arrow Right to step
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText(/Step: 1/)).toBeVisible();
});
```

## Integration Points

- **Phase 5**: Playback controls get keyboard shortcuts
- **Phase 6**: Task inspector gets focus trap
- **Session 7.2**: ARIA labels will enhance keyboard navigation
- **Session 7.3**: Mobile layout will adjust tab order

## References

- [MDN Keyboard Navigation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [Tailwind Focus Utilities](https://tailwindcss.com/docs/ring-width)
- [ARIA Authoring Practices - Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Radix UI Focus Management](https://www.radix-ui.com/docs/primitives/utilities/focus-guards)

## Notes

### Why Custom Hooks?

- **Reusability**: Use keyboard shortcuts in multiple components
- **Separation of Concerns**: Keep event logic separate from UI
- **Testability**: Can test hooks in isolation
- **Type Safety**: Full TypeScript support

### Focus Trap Pattern

Focus traps are essential for modal dialogs:
1. Store reference to element that opened modal
2. Get all focusable elements inside modal
3. On Tab, cycle through them
4. On Shift+Tab, cycle backward
5. When modal closes, return focus to trigger

### Tailwind Focus Utilities

Tailwind provides excellent focus utilities:
- `focus:outline-none` - Remove default outline
- `focus:ring-2` - Add 2px ring
- `focus:ring-blue-500` - Ring color
- `focus:ring-offset-2` - Space between element and ring
- `focus:ring-offset-zinc-900` - Ring offset color (matches background)

### Skip Links

Skip links help keyboard users bypass repetitive navigation:
- Hidden by default with `sr-only`
- Visible when focused with `focus:not-sr-only`
- Positioned absolutely to appear at top
- Links to `id="main-content"` on Canvas
