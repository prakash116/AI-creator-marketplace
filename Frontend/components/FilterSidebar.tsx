'use client';

import { CONTENT_TYPES, LOCATIONS, SKILLS, SPECIALIZATIONS, TOOLS } from '@/data/seed';
import { cn } from '@/lib/utils';
import type { CreatorFilters } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Check, ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type ArrayKey = 'specialization' | 'skill' | 'tool' | 'contentType' | 'location' | 'experience';

const EXPERIENCE = [
  { value: '0-2', label: '0–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '6-9', label: '6–9 years' },
  { value: '10+', label: '10+ years' },
];

function Group({ title, count, children, defaultOpen = true }: { title: string; count: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full cursor-pointer items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && <span className="rounded-full bg-purple/20 px-1.5 text-[11px] text-violet-200">{count}</span>}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-subtle transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-left text-sm text-muted transition hover:text-white">
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
          checked ? 'border-purple bg-purple text-white' : 'border-white/20 group-hover:border-white/40',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={checked ? 'text-white' : ''}>{label}</span>
    </button>
  );
}

function Chip({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1.5 text-xs transition',
        checked ? 'border-purple/60 bg-purple/15 text-white' : 'border-line text-muted hover:border-white/20 hover:text-white',
      )}
    >
      {label}
    </button>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: CreatorFilters;
  onChange: (f: CreatorFilters) => void;
  onReset: () => void;
}) {
  const toggle = (key: ArrayKey, value: string) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const activeCount =
    filters.specialization.length + filters.skill.length + filters.tool.length + filters.contentType.length + filters.location.length + filters.experience.length + (filters.verified ? 1 : 0);

  return (
    <aside className="surface p-5">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-semibold">Filters</p>
        {activeCount > 0 && (
          <button onClick={onReset} className="cursor-pointer text-xs text-purple hover:text-violet-300">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Group title="Verification" count={filters.verified ? 1 : 0}>
        <button
          onClick={() => onChange({ ...filters, verified: !filters.verified })}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition',
            filters.verified ? 'border-cyan/40 bg-cyan/10 text-white' : 'border-line text-muted hover:text-white',
          )}
        >
          <span className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-cyan" /> Verified only
          </span>
          <span className={cn('relative h-5 w-9 rounded-full transition', filters.verified ? 'bg-cyan' : 'bg-white/15')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', filters.verified ? 'left-[18px]' : 'left-0.5')} />
          </span>
        </button>
      </Group>

      <Group title="Specialization" count={filters.specialization.length}>
        {SPECIALIZATIONS.map((s) => (
          <CheckRow key={s} label={s} checked={filters.specialization.includes(s)} onClick={() => toggle('specialization', s)} />
        ))}
      </Group>

      <Group title="AI Tools" count={filters.tool.length}>
        <div className="flex flex-wrap gap-1.5">
          {TOOLS.map((t) => (
            <Chip key={t.id} label={t.name} checked={filters.tool.includes(t.name)} onClick={() => toggle('tool', t.name)} />
          ))}
        </div>
      </Group>

      <Group title="Content Type" count={filters.contentType.length}>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((c) => (
            <Chip key={c} label={c} checked={filters.contentType.includes(c)} onClick={() => toggle('contentType', c)} />
          ))}
        </div>
      </Group>

      <Group title="Skills" count={filters.skill.length} defaultOpen={false}>
        {SKILLS.map((s) => (
          <CheckRow key={s.id} label={s.name} checked={filters.skill.includes(s.name)} onClick={() => toggle('skill', s.name)} />
        ))}
      </Group>

      <Group title="Experience" count={filters.experience.length} defaultOpen={false}>
        {EXPERIENCE.map((e) => (
          <CheckRow key={e.value} label={e.label} checked={filters.experience.includes(e.value)} onClick={() => toggle('experience', e.value)} />
        ))}
      </Group>

      <Group title="Location" count={filters.location.length} defaultOpen={false}>
        {LOCATIONS.map((l) => (
          <CheckRow key={l} label={l} checked={filters.location.includes(l)} onClick={() => toggle('location', l)} />
        ))}
      </Group>
    </aside>
  );
}
