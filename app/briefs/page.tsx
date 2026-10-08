'use client';

import { ApplyModal } from '@/components/ApplyModal';
import { BriefCard } from '@/components/BriefCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { CardGridSkeleton, ErrorState } from '@/components/LoadingState';
import { SearchBar } from '@/components/SearchBar';
import { CONTENT_TYPES } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Brief } from '@/types';
import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

function BriefsList() {
  const params = useSearchParams();
  const highlight = params.get('highlight');
  const { data, loading, error, reload, setData } = useAsync(() => api.getBriefs(), []);
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<Brief | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (b) =>
        (type === 'All' || b.contentType === type) &&
        (!q || [b.title, b.brandName, b.style, b.description, ...b.requiredSkills].join(' ').toLowerCase().includes(q)),
    );
  }, [data, type, search]);

  return (
    <div className="container-x pt-28 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Creative briefs</h1>
          <p className="mt-3 text-muted">Open projects from brands and agencies looking for AI-native talent.</p>
        </div>
        <Button href="/briefs/create">
          <Plus className="h-4 w-4" /> Post a Brief
        </Button>
      </motion.div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search briefs, brands or skills..." className="lg:max-w-md lg:flex-1" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {['All', ...CONTENT_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm transition',
                type === t ? 'border-white bg-white text-black' : 'border-line text-muted hover:text-white',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 mb-5 text-sm text-muted">
        <span className="font-semibold text-white">{filtered.length}</span> open {filtered.length === 1 ? 'brief' : 'briefs'}
      </p>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <CardGridSkeleton count={4} className="xl:grid-cols-2" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No briefs found"
          description="Try a different content type or search term."
          action={<Button href="/briefs/create" size="sm">Post the first one</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((b, i) => (
            <BriefCard key={b.id} brief={b} index={i} onApply={setApplying} highlight={b.id === highlight} />
          ))}
        </div>
      )}

      <ApplyModal
        brief={applying}
        onClose={() => setApplying(null)}
        onApplied={(u) => setData((list) => (list ?? []).map((b) => (b.id === u.id ? { ...b, applicants: u.applicants } : b)))}
      />
    </div>
  );
}

export default function BriefsPage() {
  return (
    <Suspense fallback={null}>
      <BriefsList />
    </Suspense>
  );
}
