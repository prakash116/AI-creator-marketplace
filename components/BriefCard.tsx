'use client';

import type { Brief } from '@/types';
import { daysUntil, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, ShieldCheck, Users } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { contentIcon } from './PortfolioCard';

export function BriefCard({ brief, onApply, index = 0, highlight = false }: { brief: Brief; onApply?: (b: Brief) => void; index?: number; highlight?: boolean }) {
  const Icon = contentIcon[brief.contentType];
  const days = daysUntil(brief.deadline);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -3 }}
      className={`surface flex h-full flex-col p-6 transition-colors hover:border-purple/30 ${highlight ? 'border-purple/50 ring-4 ring-purple/10' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-cyan/20 text-sm font-semibold">
            {brief.brandName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-muted">{brief.brandName}</p>
            <h3 className="font-semibold leading-snug">{brief.title}</h3>
          </div>
        </div>
        {highlight ? <Badge tone="success">New</Badge> : <Badge tone={days <= 14 ? 'warning' : 'default'}>{days > 0 ? `${days}d left` : 'Closing'}</Badge>}
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted">{brief.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <Icon className="h-4 w-4 text-purple" /> {brief.contentType}
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <DollarSign className="h-4 w-4 text-purple" /> {brief.budget}
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <Calendar className="h-4 w-4 text-purple" /> {formatDate(brief.deadline)}
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-purple" /> {brief.commercialUse}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {brief.style && <Badge tone="cyan">{brief.style}</Badge>}
        {brief.requiredSkills.slice(0, 3).map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> {brief.applicants} applicants
        </span>
        <div className="flex gap-2">
          <Button href={`/briefs/${brief.id}`} variant="outline" size="sm">
            View Brief
          </Button>
          <Button size="sm" onClick={() => onApply?.(brief)}>
            Apply
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
