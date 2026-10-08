'use client';

import { ApplyModal } from '@/components/ApplyModal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/LoadingState';
import { contentIcon } from '@/components/PortfolioCard';
import { SmartImage } from '@/components/SmartImage';
import { CREATORS } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { daysUntil, formatDate } from '@/lib/utils';
import type { Brief } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, FileX, Monitor, Ratio, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: brief, loading, error, reload, setData } = useAsync(() => api.getBrief(id), [id]);
  const [applying, setApplying] = useState<Brief | null>(null);
  const matches = useAsync(
    () => (brief ? api.getCreators({ contentType: [brief.contentType], sort: 'rating', limit: 3 }) : Promise.resolve({ data: [], total: 0 })),
    [brief?.id],
  );

  if (loading) return <LoadingState label="Loading brief…" />;
  if (error || !brief) {
    return (
      <div className="container-x pt-32 pb-24">
        {error?.toLowerCase().includes('not found') ? (
          <EmptyState icon={<FileX className="h-6 w-6" />} title="Brief not found" description="It may have been closed or removed." action={<Button href="/briefs">Browse briefs</Button>} />
        ) : (
          <ErrorState message={error ?? 'Unable to load brief'} onRetry={reload} />
        )}
      </div>
    );
  }

  const Icon = contentIcon[brief.contentType];
  const invited = CREATORS.find((c) => c.id === brief.invitedCreatorId);
  const days = daysUntil(brief.deadline);
  const facts = [
    { icon: Icon, label: 'Content type', value: brief.contentType },
    { icon: DollarSign, label: 'Budget', value: brief.budget },
    { icon: Calendar, label: 'Delivery', value: formatDate(brief.deadline) },
    { icon: Ratio, label: 'Aspect ratio', value: brief.aspectRatio },
    { icon: Monitor, label: 'Platforms', value: brief.platform.join(', ') || '—' },
    { icon: ShieldCheck, label: 'Usage rights', value: brief.commercialUse },
  ];

  return (
    <div className="container-x pt-28 pb-24">
      <Link href="/briefs" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All briefs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-cyan/20 font-semibold">{brief.brandName.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="text-sm text-muted">{brief.brandName}</p>
              <p className="text-xs text-subtle">Posted {formatDate(brief.createdAt)}</p>
            </div>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">{brief.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="success">Open</Badge>
            {brief.style && <Badge tone="cyan">{brief.style}</Badge>}
            {brief.mood && <Badge>{brief.mood}</Badge>}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-card p-4">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <f.icon className="h-3.5 w-3.5" /> {f.label}
                </p>
                <p className="mt-1.5 text-sm font-medium">{f.value}</p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="mb-3 font-semibold">Project description</h2>
            <p className="leading-relaxed text-zinc-300">{brief.description}</p>
          </section>

          {(brief.visualDirection || brief.reference) && (
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              {brief.visualDirection && (
                <div className="surface p-5">
                  <p className="label">Visual direction</p>
                  <p className="text-sm text-zinc-300">{brief.visualDirection}</p>
                </div>
              )}
              {brief.reference && (
                <div className="surface p-5">
                  <p className="label">References</p>
                  <p className="text-sm break-words text-zinc-300">{brief.reference}</p>
                </div>
              )}
            </section>
          )}

          {brief.requiredSkills.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-semibold">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {brief.requiredSkills.map((s) => (
                  <Badge key={s} className="px-3 py-1.5 text-sm">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {matches.data && matches.data.data.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 font-semibold">Recommended creators for this brief</h2>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {matches.data.data.map((c, i) => (
                  <CreatorCard key={c.id} creator={c} index={i} />
                ))}
              </div>
            </section>
          )}
        </motion.div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-6">
            <p className="text-sm text-muted">Budget</p>
            <p className="mt-1 text-2xl font-semibold">{brief.budget}</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Deadline</span>
                <span>{days > 0 ? `${days} days left` : 'Closing soon'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Start date</span>
                <span>{formatDate(brief.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-muted">
                  <Users className="h-3.5 w-3.5" /> Applicants
                </span>
                <span>{brief.applicants}</span>
              </div>
            </div>
            <Button className="mt-6 w-full" onClick={() => setApplying(brief)}>
              Apply to this brief
            </Button>
            <Button href="/creators" variant="outline" className="mt-2 w-full">
              Find creators
            </Button>
          </div>
          {invited && (
            <Link href={`/creators/${invited.id}`} className="surface flex items-center gap-3 p-4 transition hover:border-purple/30">
              <SmartImage src={invited.avatar} alt={invited.name} className="h-11 w-11 rounded-xl" />
              <div>
                <p className="text-xs text-muted">Invited creator</p>
                <p className="text-sm font-medium">{invited.name}</p>
              </div>
            </Link>
          )}
        </aside>
      </div>

      <ApplyModal brief={applying} onClose={() => setApplying(null)} onApplied={(u) => setData((b) => (b ? { ...b, applicants: u.applicants } : b))} />
    </div>
  );
}
