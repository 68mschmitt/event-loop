import React from 'react';
import { cn } from '@/lib/utils';

interface RegionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function Region({ 
  title, 
  count, 
  children, 
  className,
  emptyMessage = 'Empty'
}: RegionProps) {
  const hasContent = React.Children.count(children) > 0;
  
  return (
    <div className={cn(
      'rounded-lg border border-zinc-700 bg-zinc-900/50 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-xs font-mono text-zinc-300">
            {count}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 min-h-[120px]">
        {!hasContent ? (
          <p className="text-sm text-zinc-500 text-center mt-8">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
