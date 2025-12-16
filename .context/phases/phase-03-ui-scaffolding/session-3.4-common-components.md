# Session 3.4: Common UI Components

## Overview

This session creates reusable UI primitives that will be used throughout the application. Using Radix UI for accessible base components and Tailwind for styling, we'll build Button, Select, Tooltip, Badge, and Card components. These components encapsulate consistent styling, accessibility attributes, and TypeScript props interfaces. They serve as the foundation for controls, panels, and other UI elements built in later phases.

## Prerequisites

- Session 3.3 complete (panel structure exists)
- Familiarity with Radix UI primitives
- Understanding of TypeScript generics (for Select)
- Knowledge of compound component patterns

## Goals

- [ ] Install Radix UI primitives (`@radix-ui/react-tooltip`, `@radix-ui/react-select`)
- [ ] Create `Button` component with variants (primary, secondary, ghost)
- [ ] Create `Select` component with proper accessibility
- [ ] Create `Tooltip` component for contextual help
- [ ] Create `Badge` component for status indicators
- [ ] Create `Card` component for content grouping
- [ ] Create utility function `cn()` for className merging
- [ ] Add proper TypeScript prop interfaces
- [ ] Ensure all components are keyboard accessible
- [ ] Add hover/focus states with Tailwind

## Files to Create

### `src/lib/utils.ts`
**Purpose:** Utility functions (className merging)
**Exports:** `cn()` function
**Key responsibilities:**
- Merge Tailwind classes intelligently
- Handle conditional classes

### `src/components/common/Button.tsx`
**Purpose:** Accessible button with variants
**Exports:** `Button` component
**Key responsibilities:**
- Primary, secondary, ghost variants
- Disabled state
- Loading state (spinner)
- Icon support

### `src/components/common/Select.tsx`
**Purpose:** Accessible select dropdown
**Exports:** `Select` component
**Key responsibilities:**
- Radix Select wrapper
- Generic type support
- Custom styling
- Keyboard navigation

### `src/components/common/Tooltip.tsx`
**Purpose:** Contextual help tooltips
**Exports:** `Tooltip` component
**Key responsibilities:**
- Radix Tooltip wrapper
- Hover and focus trigger
- Portal rendering
- Delay configuration

### `src/components/common/Badge.tsx`
**Purpose:** Small status indicators
**Exports:** `Badge` component
**Key responsibilities:**
- Color variants (info, success, warning, error)
- Size variants (sm, md)
- Dot indicator option

### `src/components/common/Card.tsx`
**Purpose:** Content grouping container
**Exports:** `Card` component
**Key responsibilities:**
- Border and padding
- Optional header/footer
- Hover state

### `src/components/common/index.ts`
**Purpose:** Barrel export
**Exports:** All common components

## Type Definitions

### Button Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

### Select Props
```typescript
interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}
```

### Tooltip Props
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}
```

### Badge Props
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}
```

### Card Props
```typescript
interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}
```

## Implementation Specifications

### Install Dependencies

```bash
npm install @radix-ui/react-tooltip @radix-ui/react-select
npm install clsx tailwind-merge
```

### Utility Function

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently, handling conflicts.
 * Example: cn('px-2', 'px-4') => 'px-4' (last wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Button Component

```typescript
// src/components/common/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600 active:bg-zinc-500',
  ghost: 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  );
}
```

### Select Component

```typescript
// src/components/common/Select.tsx
import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
}: SelectProps<T>) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2',
          'px-4 py-2 rounded-lg',
          'bg-zinc-800 text-zinc-200 text-sm',
          'border border-zinc-700 hover:border-zinc-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-w-[120px]'
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(
            'overflow-hidden rounded-lg',
            'bg-zinc-800 border border-zinc-700',
            'shadow-lg'
          )}
          position="popper"
          sideOffset={5}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  'relative flex items-center px-8 py-2 rounded',
                  'text-sm text-zinc-200',
                  'cursor-pointer select-none',
                  'hover:bg-zinc-700 focus:bg-zinc-700',
                  'focus-visible:outline-none',
                  'data-[state=checked]:bg-blue-600'
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute left-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
```

### Tooltip Component

```typescript
// src/components/common/Tooltip.tsx
import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  delayDuration = 200,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={5}
            className={cn(
              'px-3 py-2 rounded-lg',
              'bg-zinc-800 text-zinc-100 text-sm',
              'border border-zinc-700',
              'shadow-lg',
              'z-50',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-zinc-800" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
```

### Badge Component

```typescript
// src/components/common/Badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-zinc-700 text-zinc-300 border-zinc-600',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const dotColors = {
  info: 'bg-blue-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  neutral: 'bg-zinc-400',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
```

### Card Component

```typescript
// src/components/common/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  header,
  footer,
  className,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-700 bg-zinc-900/50 overflow-hidden',
        hoverable && 'hover:border-zinc-600 transition-colors',
        className
      )}
    >
      {header && (
        <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-zinc-700 bg-zinc-800/50">
          {footer}
        </div>
      )}
    </div>
  );
}
```

### Barrel Export

```typescript
// src/components/common/index.ts
export { Button } from './Button';
export { Select } from './Select';
export { Tooltip } from './Tooltip';
export { Badge } from './Badge';
export { Card } from './Card';
```

## Success Criteria

- [ ] All components render without errors
- [ ] Button variants style correctly
- [ ] Button loading state shows spinner
- [ ] Select dropdown opens and closes
- [ ] Select keyboard navigation works
- [ ] Tooltip appears on hover/focus
- [ ] Badge variants display correct colors
- [ ] Card header/footer render conditionally
- [ ] All components accept className prop for extension
- [ ] TypeScript types are correct
- [ ] Focus visible styles present on all interactive elements

## Test Specifications

### Test: Button renders with variants
**Given:** Button with variant="primary"
**When:** Rendered
**Then:** Primary styles applied

```typescript
test('button renders primary variant', () => {
  render(<Button variant="primary">Click me</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('bg-blue-600');
});
```

### Test: Button loading state
**Given:** Button with isLoading=true
**When:** Rendered
**Then:** Spinner visible, button disabled

```typescript
test('button shows loading state', () => {
  render(<Button isLoading>Loading</Button>);
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
});
```

### Test: Select opens dropdown
**Given:** Select component
**When:** Click trigger
**Then:** Options visible

```typescript
test('select opens dropdown on click', async () => {
  const options = [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
  ];
  
  render(
    <Select value="1" onValueChange={() => {}} options={options} />
  );
  
  const trigger = screen.getByRole('combobox');
  fireEvent.click(trigger);
  
  expect(await screen.findByText('Two')).toBeVisible();
});
```

### Test: Tooltip appears
**Given:** Tooltip component
**When:** Hover over child
**Then:** Tooltip content visible

```typescript
test('tooltip shows on hover', async () => {
  render(
    <Tooltip content="Help text">
      <button>Hover me</button>
    </Tooltip>
  );
  
  const button = screen.getByRole('button');
  fireEvent.mouseEnter(button);
  
  expect(await screen.findByText('Help text')).toBeVisible();
});
```

### Test: Badge renders with dot
**Given:** Badge with dot=true
**When:** Rendered
**Then:** Dot indicator visible

```typescript
test('badge renders dot indicator', () => {
  const { container } = render(
    <Badge dot variant="success">Active</Badge>
  );
  
  const dot = container.querySelector('[aria-hidden="true"]');
  expect(dot).toHaveClass('bg-green-400');
});
```

### Test: Card renders sections
**Given:** Card with header and footer
**When:** Rendered
**Then:** All sections visible

```typescript
test('card renders header and footer', () => {
  render(
    <Card header="Header" footer="Footer">
      Content
    </Card>
  );
  
  expect(screen.getByText('Header')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
  expect(screen.getByText('Footer')).toBeInTheDocument();
});
```

### Test: className merging
**Given:** Button with custom className
**When:** Rendered
**Then:** Both base and custom classes applied

```typescript
test('cn utility merges classes correctly', () => {
  render(<Button className="custom-class">Test</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('custom-class');
  expect(button).toHaveClass('rounded-lg'); // Base class still present
});
```

## Integration Points

- **Phase 5**: Button and Select used in playback controls
- **Phase 6**: Select used in preset selector, Button in builder
- **Phase 8**: Tooltip used for task metadata, Badge for task states
- **All UI**: Card used for content grouping throughout

## References

- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select)
- [Tailwind Merge](https://github.com/dcastil/tailwind-merge)
- [clsx](https://github.com/lukeed/clsx)

## Notes

### Why Radix UI?
- Unstyled primitives (full design control)
- Accessibility built-in
- Composable API
- Handles complex interactions (focus, portal, keyboard)

### Component composition
- Each component is a building block
- Can be composed to create more complex UIs
- Consistent styling across the app

### TypeScript generics
- Select uses generic `<T extends string>` for type-safe values
- Options array type matches value type
- onValueChange receives typed value

### cn() utility
- Intelligently merges Tailwind classes
- Handles conflicts (last class wins)
- Essential for component className extension

### Variants pattern
- Object mapping for variant styles
- Easy to add new variants
- Type-safe with TypeScript

### Future enhancements
- IconButton component (Button without text)
- Input component (text fields)
- Checkbox/Radio components
- Modal/Dialog wrapper
