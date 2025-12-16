# Technology Stack

This document outlines the technology choices for the Event Loop Visualizer and the rationale behind each decision.

## Core Technologies

### TypeScript 5.x
**Purpose:** Type-safe JavaScript with advanced type system features

**Rationale:**
- Essential for modeling complex data structures (Task, SimulatorState, etc.)
- Discriminated unions perfect for task types
- Type inference reduces boilerplate
- Catch errors at compile-time rather than runtime
- Excellent IDE support for large codebases

**Configuration:**
- Strict mode enabled
- `noUncheckedIndexedAccess` for array safety
- `exactOptionalPropertyTypes` for precision
- Path aliases for clean imports

### React 18+
**Purpose:** UI framework with hooks and concurrent features

**Rationale:**
- Hooks provide clean state management patterns
- Context API suitable for app-wide state
- Large ecosystem and community
- Excellent TypeScript support
- Concurrent features enable smooth animations
- Component architecture matches visualization needs (regions, panels, controls)

**Key Patterns:**
- `useReducer` for complex state (simulator state)
- Custom hooks for reusable logic
- Context for dependency injection
- Functional components throughout

### Vite
**Purpose:** Build tool and development server

**Rationale:**
- Extremely fast hot module replacement (HMR)
- Native ESM in development
- Optimized production builds
- Excellent TypeScript support out of the box
- Simple configuration
- Fast test execution with Vitest

## State Management

### React useReducer + Context
**Purpose:** Application state management

**Rationale:**
- Built-in React APIs, no external dependencies
- Perfect fit for deterministic state transitions (simulator is a state machine)
- Easy to test reducers in isolation
- Time-travel debugging natural with immutable state
- Context prevents prop drilling
- Lighter weight than Redux for this use case

### Immer
**Purpose:** Immutable state updates

**Rationale:**
- Write mutable-looking code that produces immutable results
- Simplifies complex nested updates
- Reduces errors from accidental mutations
- Good TypeScript support
- Minimal performance overhead
- Makes reducer logic more readable

## Animation

### Framer Motion
**Purpose:** Declarative animations and transitions

**Rationale:**
- Declarative API matches React's paradigm
- Layout animations handle complex position changes automatically
- AnimatePresence for enter/exit animations
- Gesture support for future interactions
- Orchestration APIs for sequencing
- Built-in reduced motion support
- Excellent TypeScript definitions
- Better suited for complex choreography than React Spring for this use case

**Alternative Considered:**
- React Spring: More granular control but steeper learning curve
- CSS animations: Not sufficient for dynamic path-based animations

## UI Components & Styling

### Radix UI
**Purpose:** Unstyled, accessible UI primitives

**Rationale:**
- Accessibility built-in (ARIA, keyboard navigation)
- Unstyled allows full design control
- Composable primitives (Dialog, Tabs, Slider, etc.)
- Excellent TypeScript support
- Well-documented
- Covers complex components (timeline scrubber, panels)

**Components to Use:**
- `@radix-ui/react-tabs` - Side panel tabs
- `@radix-ui/react-slider` - Speed control, timeline scrubber
- `@radix-ui/react-dialog` - Task inspector modal
- `@radix-ui/react-tooltip` - Task metadata tooltips

### Tailwind CSS
**Purpose:** Utility-first CSS framework

**Rationale:**
- Rapid styling without leaving JSX
- Consistent design system (spacing, colors, breakpoints)
- Built-in responsive design utilities
- Tree-shakeable (unused styles removed)
- Easy to customize via config
- Good TypeScript support with `tailwindcss-intellisense`
- Reduced motion utilities via `motion-safe` variants

**Configuration:**
- Custom color palette for task types
- Animation utilities for reduced motion
- Container queries for responsive regions

## Testing

### Vitest
**Purpose:** Unit and integration testing

**Rationale:**
- Vite-native (same configuration, extremely fast)
- Jest-compatible API (easy migration if needed)
- Built-in TypeScript support
- Great watch mode
- Fast parallel execution
- Native ESM support
- Excellent coverage reporting

### React Testing Library
**Purpose:** Component testing

**Rationale:**
- Tests behavior, not implementation
- Encourages accessible markup
- Simulates user interactions
- Works seamlessly with Vitest
- Strong community and patterns
- Query APIs match accessibility best practices

### Playwright
**Purpose:** End-to-end testing

**Rationale:**
- Tests critical user journeys (load preset, step through, scrub timeline)
- Cross-browser testing
- Excellent debugging tools
- Reliable selectors
- Screenshots and videos on failure
- Good for animation/timing tests

**Test Coverage:**
- E2E tests for acceptance criteria
- Integration tests for state transitions
- Unit tests for simulator logic

## Code Quality

### ESLint
**Purpose:** JavaScript/TypeScript linting

**Rationale:**
- Catches common errors
- Enforces consistent style
- TypeScript-specific rules
- React hooks rules
- Accessibility linting with `eslint-plugin-jsx-a11y`

**Plugins:**
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-jsx-a11y`

### Prettier
**Purpose:** Code formatting

**Rationale:**
- Consistent formatting across the project
- Automatic on save
- Integrates with ESLint
- Zero configuration needed

## Build & Deployment

### Vite Build
**Purpose:** Production builds

**Features:**
- Code splitting
- Tree shaking
- Asset optimization
- Source maps for debugging

### Vercel / Netlify (Recommended)
**Purpose:** Hosting and deployment

**Rationale:**
- Zero-config deployment from git
- Automatic preview deployments
- CDN distribution
- HTTPS by default
- Good for static sites

## Development Tools

### TypeScript Language Server
- Fast type checking
- IntelliSense in VSCode

### Vite Dev Server
- Instant HMR
- Fast startup

### Browser DevTools
- React DevTools
- Redux DevTools (if needed for state inspection)

## Dependencies Summary

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0",
    "immer": "^10.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tooltip": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@playwright/test": "^1.42.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "prettier": "^3.2.0"
  }
}
```

## Alternatives Considered

### State Management
- **Zustand**: Simpler than Context+Reducer but less suitable for time-travel
- **Redux Toolkit**: Overkill for this scope; Immer already included
- **Jotai/Recoil**: Atomic state not needed; simulation state is inherently coupled

### Animation
- **React Spring**: More physics-based; harder to sequence complex choreography
- **GSAP**: Imperative API; doesn't match React patterns as well
- **CSS Animations**: Insufficient for dynamic path-based animations

### Styling
- **Styled Components**: Runtime cost; Tailwind provides better DX for utilities
- **CSS Modules**: More boilerplate than Tailwind; harder to maintain consistency
- **Vanilla CSS**: Too much manual work for responsive design

### Testing
- **Jest**: Vitest is faster and Vite-native
- **Cypress**: Playwright has better DX and cross-browser support
- **Enzyme**: React Testing Library is the modern standard

## Version Pinning Strategy

- **React, TypeScript, Vite**: Pin minor versions, allow patch updates
- **UI libraries**: Pin minor versions for stability
- **Dev tools**: Allow minor updates
- Use `package-lock.json` or `pnpm-lock.yaml` for reproducible installs

## Browser Support

**Target:** Modern evergreen browsers (latest 2 versions)
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

**Not supported:** Internet Explorer (EOL)

**Polyfills:** None required for target browsers
