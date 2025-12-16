# Phase 7: Accessibility

## Overview

Phase 7 makes the Event Loop Visualizer **fully accessible** and **responsive** across devices and user capabilities. This phase ensures the application meets WCAG 2.1 AA standards and provides an excellent experience for all users, including those using keyboards, screen readers, and mobile devices.

## Goals

By the end of Phase 7, you will have:
- ✅ Complete keyboard navigation with focus management
- ✅ Comprehensive ARIA labeling and live regions
- ✅ Screen reader support with meaningful announcements
- ✅ Mobile-responsive layout with touch-friendly controls
- ✅ Reduced motion support (from Phase 4)
- ✅ Color contrast compliance (WCAG AA)
- ✅ Focus indicators for all interactive elements
- ✅ Keyboard shortcuts for common actions
- ✅ Collapsible panels for small screens

## Why This Phase Matters

Accessibility is not optional - it's fundamental:
- **Legal Compliance**: Many jurisdictions require accessible web applications
- **Broader Reach**: 15-20% of users have some form of disability
- **Better UX**: Keyboard navigation and clear focus indicators help everyone
- **SEO Benefits**: Screen reader support improves content discoverability
- **Educational Tool**: As a learning resource, it should be accessible to all students

## Sessions

### Session 7.1: Keyboard Navigation and Focus Management
**Duration:** 3-4 hours
**Complexity:** Medium-High

Implement comprehensive keyboard navigation, focus management (including focus traps for modals), keyboard shortcuts, and visible focus indicators using Tailwind utilities.

[See session-7.1-keyboard-nav.md](./session-7.1-keyboard-nav.md)

### Session 7.2: ARIA Support and Screen Readers
**Duration:** 3-4 hours
**Complexity:** Medium-High

Add ARIA labels, roles, and properties throughout the application. Implement aria-live regions for dynamic content updates and ensure screen reader announcements for state changes.

[See session-7.2-aria-support.md](./session-7.2-aria-support.md)

### Session 7.3: Mobile Responsive Layout
**Duration:** 3-4 hours
**Complexity:** Medium

Transform the desktop layout into a mobile-friendly experience using Tailwind's responsive utilities. Implement collapsible panels, stacked layouts, and touch-friendly controls.

[See session-7.3-mobile-responsive.md](./session-7.3-mobile-responsive.md)

## Key Concepts

### WCAG 2.1 AA Compliance

We target WCAG 2.1 Level AA, which includes:
- **Perceivable**: Information presented in ways all users can perceive
- **Operable**: UI components must be operable via keyboard
- **Understandable**: Information and UI must be understandable
- **Robust**: Content must work with current and future assistive technologies

### Keyboard Navigation

All functionality must be keyboard accessible:
- **Tab**: Move focus forward
- **Shift+Tab**: Move focus backward
- **Enter/Space**: Activate buttons
- **Escape**: Close dialogs/panels
- **Arrow keys**: Navigate within components (timeline, sliders)

### Focus Management

- **Visible Indicators**: Clear, high-contrast focus outlines
- **Focus Traps**: Modal dialogs trap focus inside
- **Focus Restoration**: Return focus to trigger element when closing modals
- **Skip Links**: Allow skipping navigation to main content

### ARIA (Accessible Rich Internet Applications)

- **Roles**: `role="region"`, `role="button"`, `role="slider"`
- **Properties**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **States**: `aria-expanded`, `aria-pressed`, `aria-current`
- **Live Regions**: `aria-live="polite"` for dynamic updates

### Mobile-First Design

Start with mobile constraints, enhance for desktop:
- **Touch Targets**: Minimum 44×44px
- **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible Layouts**: Use Tailwind grid/flex utilities
- **Progressive Enhancement**: Core functionality works on all screen sizes

## Success Criteria

Phase 7 is complete when:
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and follows visual flow
- [ ] Focus indicators are visible with 3:1 contrast ratio
- [ ] Keyboard shortcuts work (Space, Arrow keys, Esc)
- [ ] Focus is trapped in modal dialogs
- [ ] Focus returns to trigger element when modal closes
- [ ] All regions have appropriate ARIA labels
- [ ] State changes are announced to screen readers
- [ ] Explanation panel updates trigger aria-live announcements
- [ ] Screen reader can navigate all content meaningfully
- [ ] Mobile layout displays correctly on small screens
- [ ] Panels collapse/stack on mobile
- [ ] Touch controls have adequate target size (44×44px minimum)
- [ ] All text meets WCAG AA contrast ratios (4.5:1 for normal text)
- [ ] Passes axe-core accessibility audit (zero violations)
- [ ] Works with VoiceOver (macOS/iOS) and NVDA (Windows)
- [ ] Works on Chrome, Firefox, Safari mobile and desktop

## Testing Strategy

### Automated Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Can navigate entire app with Tab key
- [ ] Focus visible on all interactive elements
- [ ] Can activate all buttons with Enter/Space
- [ ] Can close modals with Escape
- [ ] Shortcuts work (Space for play/pause, etc.)
- [ ] Timeline scrubber works with arrow keys
- [ ] Speed slider works with arrow keys

#### Screen Reader Testing
- [ ] Test with VoiceOver (macOS): Cmd+F5
- [ ] Test with NVDA (Windows): Download from nvaccess.org
- [ ] All regions properly labeled
- [ ] Button purposes clear
- [ ] State changes announced
- [ ] Explanation panel updates read aloud

#### Mobile Testing
- [ ] Layout works on iPhone SE (375px)
- [ ] Layout works on iPad (768px)
- [ ] Touch controls easy to tap
- [ ] Panels collapsible
- [ ] No horizontal scrolling
- [ ] Pinch-to-zoom works if needed

### E2E Accessibility Tests

```typescript
test('keyboard navigation flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Tab through controls
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'play-button');
  
  // Activate with Enter
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('aria-pressed', 'true');
  
  // Pause with Space
  await page.keyboard.press('Space');
  await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('aria-pressed', 'false');
});
```

## Accessibility Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox): Automated accessibility testing
- **WAVE** (Chrome/Firefox): Visual feedback about accessibility issues
- **Accessibility Insights** (Chrome/Edge): Tab stops, color contrast

### Screen Readers
- **VoiceOver** (macOS): Built-in, Cmd+F5 to enable
- **NVDA** (Windows): Free, open-source
- **JAWS** (Windows): Industry standard (paid)
- **TalkBack** (Android): Built-in mobile screen reader
- **VoiceOver** (iOS): Built-in mobile screen reader

### Testing Tools
- **jest-axe**: Automated accessibility testing in unit tests
- **Playwright**: E2E testing with accessibility assertions
- **Lighthouse**: Chrome DevTools audit (includes accessibility score)

## Common Pitfalls

### ❌ Missing aria-label on icon buttons
```typescript
// BAD
<button onClick={onPlay}>
  <PlayIcon />
</button>
```

### ✅ Provide accessible label
```typescript
// GOOD
<button onClick={onPlay} aria-label="Play simulation">
  <PlayIcon />
</button>
```

### ❌ No focus indicator
```css
/* BAD */
button:focus {
  outline: none; /* Never do this without replacement */
}
```

### ✅ Visible focus indicator
```typescript
// GOOD - Tailwind provides focus utilities
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Play
</button>
```

### ❌ Inaccessible custom slider
```typescript
// BAD - div not keyboard accessible
<div onClick={handleClick} style={{ cursor: 'pointer' }}>
  Custom Slider
</div>
```

### ✅ Use semantic elements or proper ARIA
```typescript
// GOOD - Use Radix UI primitives with built-in accessibility
<Slider.Root value={speed} onValueChange={setSpeed}>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb aria-label="Playback speed" />
</Slider.Root>
```

### ❌ Not announcing dynamic changes
```typescript
// BAD - Screen reader doesn't know content changed
<div>{explanation}</div>
```

### ✅ Use aria-live regions
```typescript
// GOOD
<div aria-live="polite" aria-atomic="true">
  {explanation}
</div>
```

## Integration with Other Phases

- **Phase 3**: Layout components get ARIA roles and responsive classes
- **Phase 4**: Animations respect `prefers-reduced-motion` (already implemented)
- **Phase 5**: Controls get keyboard shortcuts and ARIA properties
- **Phase 6**: Task inspector modal gets focus trap
- **Phase 8**: Dev mode toggle accessible via keyboard

## WCAG Guidelines Reference

### Level A (Must Have)
- **1.1.1**: All non-text content has text alternative
- **2.1.1**: All functionality available via keyboard
- **2.4.1**: Skip links to bypass repeated content
- **4.1.2**: Name, role, value for all UI components

### Level AA (Target)
- **1.4.3**: Contrast ratio of at least 4.5:1 for normal text
- **1.4.11**: Non-text contrast of at least 3:1 for UI components
- **2.4.7**: Visible focus indicator
- **3.2.4**: Consistent component behavior

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

## Next Phase

After Phase 7 completes, move to **Phase 8: Polish and Finalization** to add explanations, inspector, and dev mode.

## Estimated Timeline

- **Full-time (40 hrs/week):** 3-4 days
- **Part-time (20 hrs/week):** 1 week
- **Side project (10 hrs/week):** 2 weeks

Each session: 3-4 hours of focused work + testing
