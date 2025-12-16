# Testing Strategy

This document outlines the comprehensive testing approach for the Event Loop Visualizer.

## Testing Philosophy

### Core Principles

1. **Determinism First**: The simulator must be 100% deterministic - same input always produces same output
2. **Test Early**: Write tests alongside implementation, not after
3. **Comprehensive Coverage**: Aim for >85% code coverage
4. **Fast Feedback**: Unit tests should run in < 1 second
5. **Confidence**: Tests should give confidence to refactor

### Testing Pyramid

```
        /\
       /E2E\      <-- Few, slow, high-confidence
      /------\
     /  Int.  \   <-- Some, medium speed
    /----------\
   /   Unit     \ <-- Many, fast, focused
  /--------------\
```

- **Unit Tests (70%)**: Fast, isolated, test individual functions
- **Integration Tests (20%)**: Test modules working together
- **E2E Tests (10%)**: Test complete user flows

## Test Tooling

### Vitest
**Purpose:** Unit and integration test runner
**Why:** Fast, Vite-native, Jest-compatible API

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### React Testing Library
**Purpose:** Component testing
**Why:** Tests behavior from user perspective

```bash
npm run test:ui       # Test React components
```

### Playwright
**Purpose:** End-to-end testing
**Why:** Cross-browser, reliable, great debugging

```bash
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Interactive mode
```

## Unit Testing

### What to Unit Test

1. **Core Simulator (Priority: Critical)**
   - Type guards
   - Queue/Stack operations
   - Enqueue rules for each task type
   - Tick function priority rules
   - Microtask draining
   - Render logic
   - Time advancement

2. **Reducers (Priority: High)**
   - Each action type
   - State transitions
   - History management
   - Edge cases (empty state, max history)

3. **Utilities (Priority: Medium)**
   - ID generation
   - Time utilities
   - Assertions

4. **Scenario Validation (Priority: High)**
   - Schema validation
   - Error messages
   - Valid/invalid scenarios

### Unit Test Pattern

```typescript
import { describe, test, expect } from 'vitest';

describe('Queue', () => {
  test('maintains FIFO order', () => {
    // Given
    const queue = new QueueImpl<string>();
    
    // When
    queue.enqueue('A');
    queue.enqueue('B');
    queue.enqueue('C');
    
    // Then
    expect(queue.dequeue()).toBe('A');
    expect(queue.dequeue()).toBe('B');
    expect(queue.dequeue()).toBe('C');
  });
  
  test('returns undefined when empty', () => {
    const queue = new QueueImpl<string>();
    expect(queue.dequeue()).toBeUndefined();
  });
});
```

### Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| Core Simulator | 100% |
| Reducers | 100% |
| Enqueue Rules | 100% |
| Type Guards | 100% |
| Utilities | >95% |
| Components | >80% |

## Integration Testing

### What to Integration Test

1. **Simulator + State**
   - Dispatch action → state updates → simulator runs
   - History captures snapshots correctly
   - Step forward/back work together

2. **State + UI**
   - Context provides state to components
   - Components dispatch actions
   - Re-renders occur on state change

3. **Animations + State**
   - State changes trigger animations
   - Animation coordinator sequences correctly
   - Reduced motion disables animations

### Integration Test Pattern

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimulatorProvider } from '@/state/SimulatorContext';
import { App } from '@/App';

describe('Playback Integration', () => {
  test('step forward updates state and UI', () => {
    // Given: App with scenario loaded
    render(
      <SimulatorProvider>
        <App />
      </SimulatorProvider>
    );
    
    // When: Click step forward
    const stepButton = screen.getByRole('button', { name: /step forward/i });
    fireEvent.click(stepButton);
    
    // Then: State advances, UI updates
    expect(screen.getByText(/Step: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Explanation:/i)).toBeInTheDocument();
  });
});
```

## End-to-End Testing

### Critical User Flows to E2E Test

1. **Load and Run Preset**
   - Load preset scenario
   - Click play
   - Verify logs appear in expected order
   - Verify simulation completes

2. **Step Through Scenario**
   - Load preset
   - Step forward repeatedly
   - Verify each step updates UI
   - Verify explanation panel updates

3. **Timeline Scrubbing**
   - Load preset, play to middle
   - Drag timeline scrubber backward
   - Verify state restores correctly
   - Drag forward, verify state advances

4. **Keyboard Navigation**
   - Navigate with Tab
   - Trigger actions with Space/Enter
   - Verify focus indicators visible

5. **Build Custom Scenario**
   - Open scenario builder
   - Add timer task
   - Add microtask
   - Run scenario
   - Verify ordering

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test('load and run Promise vs Timer preset', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');
  
  // Load preset
  await page.click('[data-testid="preset-selector"]');
  await page.click('text=Promise.then vs setTimeout(0)');
  
  // Click play
  await page.click('[data-testid="play-button"]');
  
  // Wait for simulation to complete
  await page.waitForSelector('[data-testid="simulation-complete"]');
  
  // Verify logs
  const logs = await page.locator('[data-testid="console-log"]').allTextContents();
  expect(logs).toEqual(['Sync', 'Promise', 'Timeout']);
});
```

### E2E Coverage

| Flow | Priority |
|------|----------|
| Load preset → Play → Complete | Critical |
| Step through scenario | Critical |
| Scrub timeline | High |
| Keyboard navigation | High |
| Build custom scenario | Medium |
| Mobile responsive | Medium |
| Error states | Low |

## Test Data

### Fixtures

Create reusable test fixtures for common scenarios:

```typescript
// tests/fixtures/tasks.ts
export const mockSyncTask: Task = {
  type: TaskType.SYNC,
  id: 'sync-1',
  label: 'console.log("test")',
  createdAt: 0,
  enqueueSeq: 1,
  origin: 'test',
  state: TaskState.CREATED,
  durationSteps: 1,
  effects: [{ type: 'log', payload: 'test' }]
};

export const mockTimerTask: Task = {
  type: TaskType.TIMER,
  id: 'timer-1',
  label: 'setTimeout',
  delay: 10,
  // ... other fields
};
```

### Scenario Fixtures

```typescript
// tests/fixtures/scenarios.ts
export const simpleScenario: Scenario = {
  id: 'test-simple',
  name: 'Simple Test',
  description: 'For testing',
  learningObjective: 'Test scenario',
  tasks: [mockSyncTask, mockTimerTask],
  tags: ['test']
};
```

## Snapshot Testing

### When to Use Snapshots

- Type definitions (ensure no unintended changes)
- Scenario JSON structure
- Explanation text (detect accidental changes)

### Pattern

```typescript
import { test, expect } from 'vitest';

test('scenario structure matches snapshot', () => {
  const scenario = loadPreset('promise-vs-timer');
  expect(scenario).toMatchSnapshot();
});
```

### Updating Snapshots

```bash
npm run test -- -u  # Update snapshots
```

## Performance Testing

### Metrics to Track

1. **Simulator Performance**
   - Tick execution time: < 1ms
   - 1000 steps: < 1 second total
   - Memory usage: stable (no leaks)

2. **Animation Performance**
   - 60fps during animations
   - No dropped frames on 50 task scenario
   - Smooth on mobile devices

3. **Bundle Size**
   - Initial bundle: < 200KB gzipped
   - Lazy-loaded chunks: < 50KB each

### Performance Test Pattern

```typescript
import { describe, test, expect } from 'vitest';
import { performance } from 'perf_hooks';

test('tick executes in < 1ms', () => {
  const state = createInitialState();
  
  const start = performance.now();
  const newState = tick(state);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(1);
});

test('1000 ticks complete in < 1 second', () => {
  let state = createInitialState();
  // Load scenario with many steps
  
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    state = tick(state);
  }
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(1000);
});
```

## Accessibility Testing

### Automated Checks

Use `axe-core` or `jest-axe`:

```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Checks

- Screen reader testing (VoiceOver, NVDA)
- Keyboard-only navigation
- Color contrast verification
- Reduced motion testing

## Mutation Testing (Optional)

Use `Stryker` to test the tests:

```bash
npx stryker run
```

Ensures tests actually catch bugs by intentionally breaking code.

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

### Quality Gates

- Unit tests: Must pass 100%
- Coverage: > 85%
- E2E tests: Must pass 100%
- No TypeScript errors
- Lint: No errors

## Test Organization

```
tests/
├── unit/
│   ├── core/
│   │   ├── simulator.test.ts
│   │   ├── enqueue.test.ts
│   │   └── tick.test.ts
│   ├── state/
│   │   ├── reducer.test.ts
│   │   └── history.test.ts
│   └── scenarios/
│       └── validation.test.ts
├── integration/
│   ├── state-ui.test.tsx
│   └── playback.test.tsx
├── e2e/
│   ├── presets.spec.ts
│   ├── builder.spec.ts
│   └── accessibility.spec.ts
├── fixtures/
│   ├── tasks.ts
│   ├── scenarios.ts
│   └── states.ts
└── utils/
    ├── test-helpers.ts
    └── setup.ts
```

## Testing Checklist

For each session, verify:

- [ ] Unit tests written for all functions
- [ ] Edge cases covered (empty, null, invalid input)
- [ ] Integration tests for cross-module interactions
- [ ] Tests pass consistently (no flakiness)
- [ ] Coverage meets target
- [ ] Tests are readable and maintainable

## Debugging Failed Tests

### Unit Test Failures

1. Check error message carefully
2. Verify input data matches expectations
3. Add `console.log` to inspect intermediate values
4. Use debugger with `test.only`

### Integration Test Failures

1. Check React DevTools for state
2. Verify Context provides expected values
3. Check that actions are dispatched correctly
4. Add `debug()` from React Testing Library

### E2E Test Failures

1. Run with headed browser: `npm run test:e2e -- --headed`
2. Use Playwright trace viewer
3. Take screenshots at failure point
4. Verify selectors are correct

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
