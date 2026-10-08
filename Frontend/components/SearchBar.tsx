'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search creators, skills or tools...',
  className,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn('group relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-subtle transition group-focus-within:text-purple" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-14 w-full rounded-2xl border border-line bg-card pr-12 pl-14 text-[15px] text-white outline-none transition placeholder:text-subtle focus:border-purple/50 focus:ring-4 focus:ring-purple/15"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full p-1 text-subtle transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
