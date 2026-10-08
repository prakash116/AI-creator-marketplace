'use client';

import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { EmptyState } from '@/components/EmptyState';
import { FilterSidebar } from '@/components/FilterSidebar';
import { CardGridSkeleton, ErrorState } from '@/components/LoadingState';
import { SearchBar } from '@/components/SearchBar';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { emptyFilters } from '@/lib/filter';
import { cn } from '@/lib/utils';
import type { CreatorFilters } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

const ARRAY_KEYS = ['specialization', 'skill', 'tool', 'contentType', 'location', 'experience'] as const;
const QUICK = ['AI Filmmaker', 'Runway', 'Midjourney', '3D Artist', 'Fashion Editorial', 'Kling'];

function filtersFromParams(params: URLSearchParams): CreatorFilters {
  const f = emptyFilters();
  f.search = params.get('search') ?? '';
  ARRAY_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) f[k] = v.split(',').filter(Boolean);
  });
  f.verified = params.get('verified') === 'true';
  const sort = params.get('sort');
  if (sort === 'rating' || sort === 'experience') f.sort = sort;
  return f;
}

function filtersToQuery(f: CreatorFilters) {
  const p = new URLSearchParams();
  if (f.search) p.set('search', f.search);
  ARRAY_KEYS.forEach((k) => f[k].length && p.set(k, f[k].join(',')));
  if (f.verified) p.set('verified', 'true');
  if (f.sort !== 'relevance') p.set('sort', f.sort);
  return p.toString();
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function CreatorsDiscovery() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<CreatorFilters>(() => filtersFromParams(new URLSearchParams(params.toString())));
  const [mobileFilters, setMobileFilters] = useState(false);
  const debouncedSearch = useDebounced(filters.search, 250);
  const query = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);
  const queryKey = filtersToQuery(query);

  const result = useAsync(() => api.getCreators(query), [queryKey]);

  useEffect(() => {
    const qs = queryKey ? `?${queryKey}` : '';
    window.history.replaceState(null, '', `/creators${qs}`);
  }, [queryKey]);

  const activeChips = [
    ...ARRAY_KEYS.flatMap((k) => filters[k].map((v) => ({ key: k, value: v }))),
    ...(filters.verified ? [{ key: 'verified' as const, value: 'Verified only' }] : []),
  ];

  const removeChip = (key: (typeof ARRAY_KEYS)[number] | 'verified', value: string) =>
    setFilters((f) => (key === 'verified' ? { ...f, verified: false } : { ...f, [key]: f[key].filter((v) => v !== value) }));

  const reset = () => setFilters({ ...emptyFilters(), sort: filters.sort });
  const total = result.data?.total ?? 0;

  return (
    <div className="container-x pt-28 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Find your next creative partner</h1>
        <p className="mt-3 text-muted">Search verified AI filmmakers, animators, designers and 3D artists.</p>
        <SearchBar value={filters.search} onChange={(search) => setFilters((f) => ({ ...f, search }))} className="mt-8 max-w-3xl" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-subtle">Popular:</span>
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setFilters((f) => ({ ...f, search: q }))}
              className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-white/20 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <FilterSidebar filters={filters} onChange={setFilters} onReset={reset} />
          </div>
        </div>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {result.loading && !result.data ? (
                'Searching…'
              ) : (
                <>
                  <span className="font-semibold text-white">{total}</span> {total === 1 ? 'creator' : 'creators'} found
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilters(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
              </Button>
              <label className="relative flex items-center">
                <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-subtle" />
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as CreatorFilters['sort'] }))}
                  className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-card pr-4 pl-8 text-sm text-white outline-none hover:border-white/20"
                  aria-label="Sort creators"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="experience">Sort by Experience</option>
                </select>
              </label>
            </div>
          </div>

          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 flex flex-wrap gap-2 overflow-hidden">
                {activeChips.map((c) => (
                  <motion.button
                    layout
                    key={`${c.key}-${c.value}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => removeChip(c.key, c.value)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-purple/40 bg-purple/10 px-3 py-1 text-xs text-violet-100 hover:bg-purple/20"
                  >
                    {c.value} <X className="h-3 w-3" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {result.error ? (
            <ErrorState message={result.error} onRetry={result.reload} />
          ) : result.loading && !result.data ? (
            <CardGridSkeleton count={6} />
          ) : total === 0 ? (
            <EmptyState
              title="No creators found"
              description="Try removing some filters."
              action={
                <Button variant="outline" size="sm" onClick={() => setFilters(emptyFilters())}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <motion.div layout className={cn('grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity', result.loading && 'opacity-60')}>
              <AnimatePresence mode="popLayout">
                {result.data?.data.map((c, i) => (
                  <CreatorCard key={c.id} creator={c} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[88%] max-w-sm overflow-y-auto bg-ink-900 p-4"
            >
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setMobileFilters(false)}>
                  Show {total} results
                </Button>
              </div>
              <FilterSidebar filters={filters} onChange={setFilters} onReset={reset} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreatorsPage() {
  return (
    <Suspense fallback={<div className="container-x pt-28"><CardGridSkeleton /></div>}>
      <CreatorsDiscovery />
    </Suspense>
  );
}
