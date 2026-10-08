import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatsCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  className?: string;
}) {
  const positive = delta?.startsWith('+');
  return (
    <div className={cn('surface p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.03]">
          <Icon className="h-4 w-4 text-purple" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      {delta && (
        <p className={cn('mt-1 text-xs', positive ? 'text-success' : 'text-muted')}>
          {delta} <span className="text-subtle">vs last 30 days</span>
        </p>
      )}
    </div>
  );
}
