import { cn } from '@/lib/utils';
import { BadgeCheck } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'default' | 'violet' | 'cyan' | 'success' | 'warning';

const tones: Record<Tone, string> = {
  default: 'border-line bg-white/[0.04] text-zinc-300',
  violet: 'border-purple/25 bg-purple/10 text-violet-200',
  cyan: 'border-cyan/25 bg-cyan/10 text-cyan-200',
  success: 'border-success/25 bg-success/10 text-green-300',
  warning: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
};

export function Badge({ children, tone = 'default', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  );
}

export function VerifiedBadge({ className, label = false }: { className?: string; label?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-cyan', className)} title="Verified creator">
      <BadgeCheck className="h-4 w-4 fill-cyan/15" />
      {label && <span className="text-xs font-medium">Verified</span>}
    </span>
  );
}
