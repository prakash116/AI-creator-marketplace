'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/30 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap cursor-pointer';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-violet to-purple text-white shadow-[0_0_0_1px_rgba(139,92,246,0.5),0_8px_30px_-8px_rgba(124,58,237,0.7)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.8),0_10px_40px_-6px_rgba(124,58,237,0.9)] hover:brightness-110',
  secondary: 'bg-white text-black hover:bg-white/90',
  outline: 'border border-line-strong bg-white/[0.02] text-white hover:border-white/25 hover:bg-white/[0.06]',
  ghost: 'text-muted hover:bg-white/[0.06] hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', href, className, children, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
