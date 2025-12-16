import { ReactNode, ElementType, createElement } from 'react';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: ElementType;
  id?: string;
}

export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  id,
}: ScreenReaderOnlyProps) {
  return createElement(Component, { id, className: 'sr-only' }, children);
}
