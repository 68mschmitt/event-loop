# Session 7.3: Mobile Responsive Layout

## Overview

This session transforms the Event Loop Visualizer into a mobile-friendly application using Tailwind's responsive utilities. You'll implement a mobile-first layout with collapsible panels, stacked regions, and touch-friendly controls that provide an excellent experience across all screen sizes.

## Prerequisites

- Phase 3 complete (layout components exist)
- Session 7.1 complete (keyboard navigation implemented)
- Session 7.2 complete (ARIA support added)
- Understanding of Tailwind breakpoints
- Understanding of CSS Grid and Flexbox
- Mobile device or browser dev tools for testing

## Goals

- [ ] Implement mobile-first responsive layout
- [ ] Transform desktop grid into mobile stack
- [ ] Make sidebar collapsible on mobile
- [ ] Increase touch target sizes to 44×44px minimum
- [ ] Optimize visualization regions for small screens
- [ ] Make timeline horizontal scrollable on mobile
- [ ] Adjust typography for mobile readability
- [ ] Test on multiple screen sizes (375px, 768px, 1024px, 1440px)
- [ ] Ensure no horizontal scrolling
- [ ] Add mobile-specific navigation patterns

## Files to Create/Modify

### `src/hooks/useMediaQuery.ts`
**Purpose:** Custom hook for detecting screen size
**Exports:** `useMediaQuery` hook
**Key responsibilities:**
- Listen for media query changes
- Return boolean for breakpoint match
- Update on window resize

### `src/components/layout/AppLayout.tsx` (modify)
**Purpose:** Make main layout responsive
**Changes:**
- Mobile: Single column stack
- Tablet: Adjusted spacing
- Desktop: Original grid layout

### `src/components/layout/Sidebar.tsx` (modify)
**Purpose:** Make sidebar collapsible on mobile
**Changes:**
- Toggle button on mobile
- Slide in/out animation
- Fixed position overlay on small screens

### `src/components/layout/Canvas.tsx` (modify)
**Purpose:** Optimize canvas for mobile
**Changes:**
- Reduce padding on small screens
- Stack visualization regions vertically
- Adjust spacing

### `src/components/visualization/VisualizationCanvas.tsx` (modify)
**Purpose:** Responsive visualization layout
**Changes:**
- Desktop: 2×2 grid
- Tablet: 2×2 grid with smaller regions
- Mobile: Single column stack

### `src/components/controls/PlaybackControls.tsx` (modify)
**Purpose:** Touch-friendly controls
**Changes:**
- Larger touch targets (min 44×44px)
- Adjust spacing for mobile
- Simplify layout on small screens

### `src/components/timeline/TimelineScrubber.tsx` (modify)
**Purpose:** Mobile-optimized timeline
**Changes:**
- Larger thumb size for touch
- Adjusted padding
- Responsive text sizing

### `src/components/panels/PanelContainer.tsx` (modify)
**Purpose:** Collapsible panels on mobile
**Changes:**
- Accordion-style on mobile
- Tabs on desktop (existing)

### `src/styles/globals.css` (modify)
**Purpose:** Add responsive utilities
**Changes:**
- Touch target utilities
- Mobile spacing adjustments

## Type Definitions

### useMediaQuery Hook

```typescript
type MediaQueryBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface MediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

type UseMediaQuery = (
  query: string | MediaQueryBreakpoint,
  options?: MediaQueryOptions
) => boolean;
```

### Responsive Props

```typescript
interface ResponsiveLayoutProps {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}
```

## Implementation Specifications

### useMediaQuery Hook

```typescript
// src/hooks/useMediaQuery.ts
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

    // Use deprecated `addListener` and `removeListener` to support Safari < 14
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    };
  }, [mediaQuery]);

  return matches;
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => !useMediaQuery('md'); // < 768px
export const useIsTablet = () => useMediaQuery('md') && !useMediaQuery('lg'); // 768px - 1023px
export const useIsDesktop = () => useMediaQuery('lg'); // >= 1024px
```

### Responsive AppLayout

```typescript
// src/components/layout/AppLayout.tsx (modifications)
import { useState } from 'react';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';

export function AppLayout() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div className="h-screen w-screen flex flex-col lg:grid lg:grid-rows-[auto_1fr_auto] lg:grid-cols-[1fr_400px]">
      {/* Toolbar - spans full width */}
      <header className="col-span-full">
        <Toolbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          showSidebarToggle={isMobile}
        />
      </header>

      {/* Main content area - responsive flex/grid */}
      <div className="flex-1 flex flex-col lg:contents overflow-hidden">
        {/* Canvas - main visualization */}
        <main className="flex-1 overflow-auto bg-zinc-900 lg:col-start-1 lg:row-start-2">
          <Canvas />
        </main>

        {/* Sidebar - collapsible on mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Timeline - bottom on all sizes */}
      <footer className="col-span-full border-t border-zinc-800">
        <Timeline />
      </footer>
    </div>
  );
}
```

### Responsive Toolbar with Mobile Menu

```typescript
// src/components/layout/Toolbar.tsx (modifications)
interface ToolbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  showSidebarToggle: boolean;
}

export function Toolbar({
  onToggleSidebar,
  sidebarOpen,
  showSidebarToggle,
}: ToolbarProps) {
  return (
    <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
      {/* Logo and title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <h1 className="text-base sm:text-xl font-semibold">
          <span className="hidden sm:inline">Event Loop Visualizer</span>
          <span className="sm:hidden">Event Loop</span>
        </h1>
      </div>

      {/* Mobile sidebar toggle */}
      {showSidebarToggle && (
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          className="p-2 sm:p-3 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px]"
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      )}

      {/* Desktop controls */}
      {!showSidebarToggle && (
        <div className="flex items-center gap-4">
          <KeyboardShortcutsHelp />
        </div>
      )}
    </div>
  );
}
```

### Collapsible Sidebar

```typescript
// src/components/layout/Sidebar.tsx (modifications)
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              aria-hidden="true"
            />

            {/* Sliding sidebar */}
            <motion.aside
              id="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-14 right-0 bottom-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto"
              role="complementary"
              aria-label="Side panel"
            >
              <div className="p-4 sm:p-6">
                <PanelContainer isMobile={isMobile} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar (always visible)
  return (
    <aside
      id="sidebar"
      className="overflow-y-auto bg-zinc-950 border-l border-zinc-800 lg:row-span-2"
      role="complementary"
      aria-label="Side panel"
    >
      <div className="p-6">
        <PanelContainer isMobile={false} />
      </div>
    </aside>
  );
}
```

### Responsive Canvas

```typescript
// src/components/layout/Canvas.tsx (modifications)
import { useIsMobile } from '@/hooks/useMediaQuery';

export function Canvas() {
  const isMobile = useIsMobile();

  return (
    <div
      id="main-content"
      className="h-full p-3 sm:p-4 md:p-6"
      tabIndex={-1}
    >
      <div className="h-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 sm:p-3 md:p-4">
        <VisualizationCanvas isMobile={isMobile} />
      </div>
    </div>
  );
}
```

### Responsive Visualization Canvas

```typescript
// src/components/visualization/VisualizationCanvas.tsx (modifications)
interface VisualizationCanvasProps {
  isMobile: boolean;
}

export function VisualizationCanvas({ isMobile }: VisualizationCanvasProps) {
  if (isMobile) {
    // Mobile: Stack vertically
    return (
      <div className="h-full flex flex-col gap-3">
        <VisualizationRegion type="callstack">
          <CallStackView />
        </VisualizationRegion>

        <VisualizationRegion type="queues">
          <QueuesView />
        </VisualizationRegion>

        <VisualizationRegion type="webapis">
          <WebApisView />
        </VisualizationRegion>

        <VisualizationRegion type="console">
          <ConsoleView />
        </VisualizationRegion>
      </div>
    );
  }

  // Desktop: 2×2 grid
  return (
    <div className="h-full grid grid-cols-2 grid-rows-2 gap-4">
      <VisualizationRegion type="callstack">
        <CallStackView />
      </VisualizationRegion>

      <VisualizationRegion type="queues">
        <QueuesView />
      </VisualizationRegion>

      <VisualizationRegion type="webapis">
        <WebApisView />
      </VisualizationRegion>

      <VisualizationRegion type="console">
        <ConsoleView />
      </VisualizationRegion>
    </div>
  );
}
```

### Touch-Friendly Playback Controls

```typescript
// src/components/controls/PlaybackControls.tsx (modifications)
import { useIsMobile } from '@/hooks/useMediaQuery';

export function PlaybackControls() {
  const { state, dispatch } = useSimulator();
  const { announce } = useAriaLive();
  const isMobile = useIsMobile();

  // Mobile: Simplified layout with larger touch targets
  if (isMobile) {
    return (
      <div
        role="group"
        aria-label="Playback controls"
        className="flex flex-col gap-3"
      >
        {/* Primary controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleStepBackward}
            disabled={!canStepBack}
            aria-label="Step backward"
            className="touch-target p-3 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <StepBackIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
            className="touch-target p-4 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPlaying ? (
              <PauseIcon className="w-7 h-7" />
            ) : (
              <PlayIcon className="w-7 h-7" />
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={!canStepForward}
            aria-label="Step forward"
            className="touch-target p-3 rounded hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <StepForwardIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Step counter */}
        <div className="text-center">
          <span className="text-sm text-zinc-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>
    );
  }

  // Desktop: Original layout
  return (
    <div
      role="group"
      aria-label="Playback controls"
      className="flex items-center gap-2"
    >
      {/* Desktop controls (existing implementation) */}
    </div>
  );
}
```

### Mobile-Optimized Timeline

```typescript
// src/components/timeline/TimelineScrubber.tsx (modifications)
import { useIsMobile } from '@/hooks/useMediaQuery';

export function TimelineScrubber() {
  const { state, dispatch } = useSimulator();
  const { announce } = useAriaLive();
  const isMobile = useIsMobile();

  const currentStep = state.stepIndex;
  const totalSteps = state.history.length;

  const handleValueChange = ([value]: number[]) => {
    dispatch({ type: 'JUMP_TO_STEP', payload: value });
    announce(`Step ${value + 1} of ${totalSteps}`, { clearAfter: 1000 });
  };

  return (
    <div
      role="group"
      aria-label="Timeline navigation"
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full"
    >
      {/* Step indicator */}
      <div className="flex items-center justify-between sm:block sm:min-w-[100px]">
        <span className="text-xs sm:text-sm text-zinc-400">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Timeline slider - larger thumb on mobile */}
      <Slider.Root
        className="relative flex items-center flex-1 h-11 sm:h-5"
        value={[currentStep]}
        min={0}
        max={totalSteps - 1}
        step={1}
        onValueChange={handleValueChange}
        aria-label="Timeline position"
      >
        <Slider.Track
          className={cn(
            'relative flex-1 rounded bg-zinc-700',
            isMobile ? 'h-2' : 'h-1'
          )}
        >
          <Slider.Range className="absolute h-full bg-blue-500 rounded" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            'block rounded-full bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500',
            isMobile ? 'w-11 h-11' : 'w-5 h-5'
          )}
          aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
          aria-valuemin={0}
          aria-valuemax={totalSteps - 1}
          aria-valuenow={currentStep}
        />
      </Slider.Root>
    </div>
  );
}
```

### Responsive Panel Container

```typescript
// src/components/panels/PanelContainer.tsx (modifications)
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';

interface PanelContainerProps {
  isMobile: boolean;
}

export function PanelContainer({ isMobile }: PanelContainerProps) {
  if (isMobile) {
    // Mobile: Accordion (collapsible sections)
    return (
      <Accordion.Root type="single" collapsible defaultValue="explanation">
        <Accordion.Item value="explanation">
          <Accordion.Trigger className="flex items-center justify-between w-full p-3 text-left font-semibold hover:bg-zinc-800 rounded touch-target">
            Explanation
            <ChevronDownIcon className="accordion-chevron w-5 h-5" />
          </Accordion.Trigger>
          <Accordion.Content className="p-3 pt-0">
            <ExplanationPanel />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="presets">
          <Accordion.Trigger className="flex items-center justify-between w-full p-3 text-left font-semibold hover:bg-zinc-800 rounded touch-target">
            Presets
            <ChevronDownIcon className="accordion-chevron w-5 h-5" />
          </Accordion.Trigger>
          <Accordion.Content className="p-3 pt-0">
            <PresetSelector />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="controls">
          <Accordion.Trigger className="flex items-center justify-between w-full p-3 text-left font-semibold hover:bg-zinc-800 rounded touch-target">
            Controls
            <ChevronDownIcon className="accordion-chevron w-5 h-5" />
          </Accordion.Trigger>
          <Accordion.Content className="p-3 pt-0">
            <PlaybackControls />
            <SpeedControl />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );
  }

  // Desktop: Tabs (existing implementation)
  return (
    <Tabs.Root defaultValue="explanation">
      <Tabs.List className="flex border-b border-zinc-800">
        <Tabs.Trigger
          value="explanation"
          className="flex-1 px-4 py-3 text-sm font-medium hover:bg-zinc-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Explanation
        </Tabs.Trigger>
        <Tabs.Trigger
          value="presets"
          className="flex-1 px-4 py-3 text-sm font-medium hover:bg-zinc-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Presets
        </Tabs.Trigger>
        <Tabs.Trigger
          value="controls"
          className="flex-1 px-4 py-3 text-sm font-medium hover:bg-zinc-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Controls
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="explanation" className="p-4">
        <ExplanationPanel />
      </Tabs.Content>

      <Tabs.Content value="presets" className="p-4">
        <PresetSelector />
      </Tabs.Content>

      <Tabs.Content value="controls" className="p-4">
        <PlaybackControls />
        <SpeedControl />
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

### Global CSS Additions

```css
/* src/styles/globals.css (additions) */

/* Touch target utility - ensures minimum 44x44px */
@layer utilities {
  .touch-target {
    @apply min-w-[44px] min-h-[44px] inline-flex items-center justify-center;
  }
}

/* Accordion chevron animation */
.accordion-chevron {
  transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

[data-state='open'] .accordion-chevron {
  transform: rotate(180deg);
}

/* Prevent body scroll when mobile menu open */
body.sidebar-open {
  @apply overflow-hidden lg:overflow-auto;
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  /* Reduce default spacing */
  .region-console {
    @apply max-h-32 overflow-y-auto;
  }

  /* Smaller task nodes */
  .task-node {
    @apply text-xs px-2 py-1;
  }

  /* Compact visualization regions */
  .visualization-region {
    @apply min-h-[120px] max-h-[200px];
  }
}
```

### Responsive Typography

```typescript
// src/styles/globals.css (additions)

/* Responsive font sizes */
:root {
  /* Base: mobile */
  --font-xs: 0.75rem;   /* 12px */
  --font-sm: 0.875rem;  /* 14px */
  --font-base: 1rem;    /* 16px */
  --font-lg: 1.125rem;  /* 18px */
  --font-xl: 1.25rem;   /* 20px */
}

@media (min-width: 640px) {
  /* Tablet */
  :root {
    --font-xs: 0.8125rem; /* 13px */
    --font-sm: 0.9375rem; /* 15px */
    --font-base: 1.0625rem; /* 17px */
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  :root {
    --font-xs: 0.75rem;
    --font-sm: 0.875rem;
    --font-base: 1rem;
  }
}
```

## Success Criteria

- [ ] Layout works on 375px (iPhone SE)
- [ ] Layout works on 768px (iPad portrait)
- [ ] Layout works on 1024px (iPad landscape)
- [ ] Layout works on 1440px+ (desktop)
- [ ] No horizontal scrolling on any screen size
- [ ] Sidebar collapses to overlay on mobile
- [ ] Sidebar opens/closes with smooth animation
- [ ] Touch targets minimum 44×44px
- [ ] Timeline thumb is 44px on mobile
- [ ] Visualization regions stack vertically on mobile
- [ ] Panels use accordion pattern on mobile
- [ ] All text is readable on mobile (minimum 14px for body)
- [ ] Spacing is appropriate for each breakpoint
- [ ] Controls remain usable at all sizes
- [ ] Keyboard navigation still works on mobile
- [ ] ARIA attributes preserved at all breakpoints

## Test Specifications

### Test: useMediaQuery hook

```typescript
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile } from '@/hooks/useMediaQuery';

test('detects mobile viewport', () => {
  window.innerWidth = 375;
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(true);
});

test('detects desktop viewport', () => {
  window.innerWidth = 1440;
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(false);
});

test('updates on window resize', () => {
  const { result, rerender } = renderHook(() => useMediaQuery('md'));

  window.innerWidth = 375;
  window.dispatchEvent(new Event('resize'));
  rerender();
  expect(result.current).toBe(false);

  window.innerWidth = 1024;
  window.dispatchEvent(new Event('resize'));
  rerender();
  expect(result.current).toBe(true);
});
```

### Test: Responsive layout structure

```typescript
test('stacks vertically on mobile', () => {
  window.innerWidth = 375;
  render(<App />);

  const canvas = screen.getByRole('main');
  const sidebar = screen.getByRole('complementary');

  // Check that sidebar is positioned fixed (overlay)
  expect(sidebar).toHaveClass('fixed');
});

test('uses grid on desktop', () => {
  window.innerWidth = 1440;
  render(<App />);

  const layout = screen.getByRole('main').parentElement;
  expect(layout).toHaveClass('lg:grid');
});
```

### Test: Touch targets

```typescript
test('controls meet minimum touch target size', () => {
  window.innerWidth = 375;
  const { container } = render(<PlaybackControls />);

  const buttons = container.querySelectorAll('button');
  buttons.forEach((button) => {
    const { width, height } = button.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
```

### Test: No horizontal scroll

```typescript
test('no horizontal overflow on mobile', () => {
  window.innerWidth = 375;
  const { container } = render(<App />);

  const body = document.body;
  expect(body.scrollWidth).toBeLessThanOrEqual(375);
});
```

### Test: Collapsible sidebar

```typescript
test('sidebar toggles on mobile', async () => {
  window.innerWidth = 375;
  const user = userEvent.setup();
  render(<App />);

  const toggleButton = screen.getByLabelText(/open sidebar/i);
  await user.click(toggleButton);

  const sidebar = screen.getByRole('complementary');
  expect(sidebar).toBeVisible();

  await user.click(toggleButton);
  await waitFor(() => {
    expect(sidebar).not.toBeVisible();
  });
});
```

### E2E: Responsive breakpoints

```typescript
import { test, expect, devices } from '@playwright/test';

test('works on iPhone SE', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone SE'],
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173');

  // Sidebar should be hidden by default
  const sidebar = page.getByRole('complementary');
  await expect(sidebar).not.toBeVisible();

  // Open sidebar
  await page.click('[aria-label="Open sidebar"]');
  await expect(sidebar).toBeVisible();

  // Controls should be touch-friendly
  const playButton = page.getByLabel('Play simulation');
  const box = await playButton.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test('works on iPad', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPad Pro'],
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173');

  // Layout should be responsive
  await expect(page.locator('[role="main"]')).toBeVisible();
  await expect(page.locator('[role="complementary"]')).toBeVisible();
});

test('works on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');

  // Grid layout visible
  const canvas = page.locator('[role="main"]');
  await expect(canvas).toBeVisible();

  // Sidebar always visible
  const sidebar = page.getByRole('complementary');
  await expect(sidebar).toBeVisible();
});
```

## Integration Points

- **Session 7.1**: Keyboard navigation remains functional on mobile
- **Session 7.2**: ARIA attributes preserved in responsive layout
- **Phase 3**: Layout components enhanced with responsive utilities
- **Phase 5**: Controls adapt to screen size

## References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Touch Target Sizes (WCAG 2.5.5)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Responsive Web Design Patterns](https://web.dev/patterns/web-vitals-patterns/responsive-design)
- [Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [Framer Motion Mobile Gestures](https://www.framer.com/motion/gestures/)

## Notes

### Tailwind Breakpoints

Default Tailwind breakpoints (mobile-first):
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

Always style mobile first, then add breakpoint prefixes for larger screens:
```html
<div class="text-sm md:text-base lg:text-lg">
  <!-- 14px mobile, 16px tablet, 18px desktop -->
</div>
```

### Touch Target Guidelines

**WCAG 2.5.5** requires:
- Minimum 44×44 CSS pixels
- 24×24px acceptable with adequate spacing
- Applies to all clickable elements
- Exception: inline text links

### Mobile-First Approach

Benefits of mobile-first:
1. Forces prioritization of essential features
2. Easier to enhance than strip down
3. Better performance (less CSS to override)
4. Aligns with progressive enhancement

Pattern:
```css
/* Mobile styles (default) */
.element { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .element { padding: 1.5rem; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element { padding: 2rem; }
}
```

### Sidebar Overlay Pattern

Mobile sidebar as overlay:
- Fixed position
- Full height
- Slide in from right
- Backdrop dims main content
- Click outside or toggle to close
- Prevents body scroll when open

### Accordion vs Tabs

**Mobile**: Accordion (vertical stack, one at a time)
- Better for small screens
- Less horizontal space needed
- Clearer hierarchy

**Desktop**: Tabs (horizontal navigation)
- Efficient use of space
- Faster switching
- More content visible

### Testing Responsive Design

Use browser dev tools:
1. Open DevTools (F12)
2. Click device icon (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test all breakpoints: 375px, 768px, 1024px, 1440px

Physical device testing:
- iOS: Safari + iPhone/iPad
- Android: Chrome + various devices
- Test landscape and portrait

### Performance Considerations

Mobile optimizations:
- Lazy load non-critical components
- Reduce animation complexity on low-end devices
- Compress images and assets
- Use `will-change` sparingly
- Test on real devices, not just simulators
