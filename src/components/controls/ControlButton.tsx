/**
 * Control Button Component
 * 
 * Reusable button for playback controls with consistent styling and accessibility.
 */

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

/**
 * Control button with icon and optional tooltip
 */
export function ControlButton({
  children,
  variant = 'default',
  size = 'md',
  tooltip,
  className,
  disabled,
  ...props
}: ControlButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900';
  
  const variantStyles = {
    default: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 disabled:bg-zinc-900 disabled:text-zinc-600',
    primary: 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600',
    ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:text-zinc-700 disabled:hover:bg-transparent',
  };
  
  const sizeStyles = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}
