'use client';

import { Badge, VerifiedBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, Skeleton } from '@/components/LoadingState';
import { Modal } from '@/components/Modal';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioModal } from '@/components/PortfolioModal';
import { SmartImage } from '@/components/SmartImage';
import { TOOLS } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { PortfolioItem } from '@/types';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Star,
  UserX,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

const SAVED_KEY = 'cre8r.savedCreators';

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </motion.section>
  );
}

const availabilityStyle = {
  Available: 'text-success bg-success/10 border-success/25',
  Limited: 'text-amber-300 bg-amber-400/10 border-amber-400/25',
  Booked: 'text-zinc-300 bg-white/5 border-line',
};

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data: creator, loading, error, reload } = useAsync(() => api.getCreator(id), [id]);
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
      setSaved(list.includes(id));
    } catch {
      /* ignore */
    }
  }, [id]);

  const toggleSave = () => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSaved((s) => !s);
    toast.success(saved ? 'Removed from saved creators' : 'Creator saved', saved ? undefined : 'Find them in your dashboard.');
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error('Message too short', 'Please write at least 10 characters.');
      return;
    }
    setContactOpen(false);
    setMessage('');
    toast.success(`Message sent to ${creator?.name}`, `Typical response time ${creator?.responseTime}.`);
  };

  if (loading) {
    return (
      <div className="container-x pt-24 pb-24">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="mt-6 flex gap-5">
          <Skeleton className="h-28 w-28 rounded-3xl" />
          <div className="flex-1 space-y-3 pt-4">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="container-x pt-32 pb-24">
        {error?.toLowerCase().includes('not found') ? (
          <EmptyState
            icon={<UserX className="h-6 w-6" />}
            title="Creator not found"
            description="This profile may have been removed or the link is incorrect."
            action={<Button href="/creators">Browse creators</Button>}
          />
        ) : (
          <ErrorState message={error ?? 'Unable to load creator'} onRetry={reload} />
        )}
      </div>
    );
  }

  const portfolio = creator.portfolio ?? [];
  const types = ['All', ...Array.from(new Set(portfolio.map((p) => p.contentType)))];
  const shown = typeFilter === 'All' ? portfolio : portfolio.filter((p) => p.contentType === typeFilter);
  const toolInfo = (name: string) => TOOLS.find((t) => t.name === name);

  return (
    <div className="pb-24">
      {/* Cover */}
      <div className="relative h-64 overflow-hidden md:h-80">
        <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} className="absolute inset-0">
          <SmartImage src={creator.cover} alt="" className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950" />
        <div className="container-x relative pt-24">
          <Link href="/creators" className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm text-zinc-200 backdrop-blur transition hover:bg-black/60">
            <ArrowLeft className="h-4 w-4" /> All creators
          </Link>
        </div>
      </div>

      <div className="container-x relative -mt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <SmartImage src={creator.avatar} alt={creator.name} className="h-32 w-32 shrink-0 rounded-3xl border-4 border-ink-950 shadow-2xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{creator.name}</h1>
                {creator.verified && <VerifiedBadge className="[&>svg]:h-6 [&>svg]:w-6" />}
              </div>
              <p className="mt-1 text-purple">{creator.specialization.join(' · ')}</p>
              <p className="mt-2 max-w-xl text-sm text-muted">{creator.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {creator.location}
                </span>
                <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', availabilityStyle[creator.availability])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> {creator.availability === 'Available' ? 'Available for work' : creator.availability === 'Limited' ? 'Limited availability' : 'Fully booked'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleSave}
              aria-label={saved ? 'Unsave creator' : 'Save creator'}
              className={cn(
                'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition',
                saved ? 'border-pink-500/40 bg-pink-500/10 text-pink-400' : 'border-line-strong text-muted hover:text-white',
              )}
            >
              <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
            </button>
            <Button variant="outline" onClick={() => setContactOpen(true)}>
              <MessageSquare className="h-4 w-4" /> Contact Creator
            </Button>
            <Button href={`/briefs/create?creator=${creator.id}`}>
              <Send className="h-4 w-4" /> Invite to Brief
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {[
            { icon: Star, label: 'Rating', value: `${creator.rating.toFixed(1)}`, sub: `${creator.reviews} reviews` },
            { icon: Briefcase, label: 'Projects completed', value: String(creator.projectsCompleted), sub: `${creator.experience} years experience` },
            { icon: Clock, label: 'Response time', value: creator.responseTime, sub: 'Average' },
            { icon: ShieldCheck, label: 'Starting rate', value: `$${creator.hourlyRate}/hr`, sub: 'Project quotes available' },
          ].map((s) => (
            <div key={s.label} className="bg-card p-5">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-subtle">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            <Section title="About">
              <p className="leading-relaxed text-zinc-300">{creator.bio}</p>
            </Section>

            <Section title="Specialization">
              <div className="grid gap-3 sm:grid-cols-3">
                {creator.focusAreas.map((f, i) => (
                  <div key={f} className="surface flex items-center gap-3 p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet/30 to-cyan/20 text-xs font-semibold">0{i + 1}</span>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {creator.skills.map((s) => (
                  <Badge key={s} className="px-3 py-1.5 text-sm">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>

            <Section title="AI Tools">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {creator.tools.map((t) => (
                  <div key={t} className="surface group p-4 transition hover:border-purple/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-gradient-to-br from-white/[0.06] to-transparent text-sm font-semibold text-violet-200">
                          {t.slice(0, 1)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t}</p>
                          <p className="text-xs text-subtle">{toolInfo(t)?.category ?? 'Tool'}</p>
                        </div>
                      </div>
                      {creator.verification.find((v) => v.type === 'tools')?.verified && <BadgeCheck className="h-4 w-4 text-cyan" />}
                    </div>
                    {toolInfo(t) && <p className="mt-3 text-xs text-muted">{toolInfo(t)!.description}</p>}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Portfolio" id="portfolio">
              <div className="mb-5 flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition',
                      typeFilter === t ? 'border-white bg-white text-black' : 'border-line text-muted hover:text-white',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {shown.length === 0 ? (
                <EmptyState title="No portfolio items yet" description="This creator hasn't published work in this category." />
              ) : (
                <div className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4">
                  {shown.map((p, i) => (
                    <div key={p.id} className="break-inside-avoid">
                      <PortfolioCard item={p} onOpen={setActive} tall={i % 3 === 0} />
                      <p className="mt-2 line-clamp-2 px-1 text-xs text-muted">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Workflow">
              <div className="relative">
                <div className="absolute top-5 bottom-5 left-[19px] w-px bg-gradient-to-b from-purple via-purple/40 to-cyan md:top-[19px] md:right-10 md:bottom-auto md:left-10 md:h-px md:w-auto md:bg-gradient-to-r" />
                <ol className="relative grid gap-5 md:grid-cols-5 md:gap-3">
                  {creator.workflow.map((w, i) => (
                    <motion.li
                      key={w.step}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 md:flex-col md:items-center md:text-center"
                    >
                      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple/40 bg-ink-950 text-sm font-semibold text-violet-200">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{w.step}</p>
                        <p className="mt-1 text-xs text-muted">{w.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="surface p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan" />
                <h3 className="font-semibold">Verification</h3>
              </div>
              <p className="mt-1 text-xs text-muted">Trust signals reviewed by the CRE8R team.</p>
              <ul className="mt-5 space-y-3">
                {creator.verification.map((v) => (
                  <li key={v.type} className="flex items-center justify-between text-sm">
                    <span className={v.verified ? 'text-white' : 'text-subtle'}>{v.label}</span>
                    {v.verified ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-zinc-600" />}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3 text-xs text-muted">
                {creator.verified ? (
                  <span className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-cyan" /> Fully verified creator
                  </span>
                ) : (
                  'Verification in progress'
                )}
              </div>
            </div>

            <div className="surface p-6">
              <h3 className="font-semibold">Content types</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {creator.contentTypes.map((c) => (
                  <Badge key={c} tone="violet">
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <Button href={`/briefs/create?creator=${creator.id}`} className="w-full">
                  Invite to Brief
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setContactOpen(true)}>
                  Contact Creator
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PortfolioModal item={active} onClose={() => setActive(null)} creatorName={creator.name} />

      <Modal open={contactOpen} onClose={() => setContactOpen(false)}>
        <form onSubmit={sendMessage} className="p-6">
          <div className="flex items-center gap-3">
            <SmartImage src={creator.avatar} alt={creator.name} className="h-11 w-11 rounded-xl" />
            <div>
              <h3 className="font-semibold">Message {creator.name}</h3>
              <p className="text-xs text-muted">Usually responds {creator.responseTime.replace('<', 'in under')}</p>
            </div>
          </div>
          <label className="label mt-6" htmlFor="msg">
            Your message
          </label>
          <textarea
            id="msg"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${creator.name.split(' ')[0]}, we're looking for a creator to help with…`}
            className="field resize-none"
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4" /> Send message
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
