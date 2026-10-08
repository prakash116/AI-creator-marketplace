'use client';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { HeroBackground } from '@/components/HeroBackground';
import { CardGridSkeleton, ErrorState } from '@/components/LoadingState';
import { contentIcon } from '@/components/PortfolioCard';
import { PortfolioModal } from '@/components/PortfolioModal';
import { SectionHeader } from '@/components/SectionHeader';
import { SmartImage } from '@/components/SmartImage';
import { CREATORS, PORTFOLIO } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { PortfolioItem } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, FileText, Rocket, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }),
};

const TRENDING: { id: string; label: string; span: string }[] = [
  { id: 'p1', label: 'AI Video', span: 'md:col-span-2 md:row-span-2' },
  { id: 'p10', label: 'AI Animation', span: '' },
  { id: 'p8', label: 'Product Visual', span: '' },
  { id: 'p4', label: 'Fashion Campaign', span: 'md:row-span-2' },
  { id: 'p19', label: 'Cinematic Artwork', span: '' },
  { id: 'p7', label: '3D Design', span: '' },
];

const STEPS = [
  { icon: FileText, title: 'Create a Brief', text: 'Describe your project, format, usage rights and budget in a structured creative brief.' },
  { icon: Search, title: 'Discover Creators', text: 'Filter by specialization, AI tools and verified workflows to find the perfect match.' },
  { icon: Rocket, title: 'Start Creating', text: 'Invite creators, review proposals and launch production with full commercial clarity.' },
];

const STATS = [
  ['2,400+', 'Verified AI creators'],
  ['18k', 'Projects delivered'],
  ['4.9/5', 'Average rating'],
  ['< 4h', 'Median response'],
];

export default function HomePage() {
  const featured = useAsync(() => api.getCreators({ featured: true, limit: 6 }), []);
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const creatorName = (id: string) => CREATORS.find((c) => c.id === id)?.name;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
        <HeroBackground />
        <div className="container-x relative z-10 py-24 text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="flex justify-center">
            <Badge tone="violet" className="px-3 py-1.5 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> The marketplace for AI-native creatives
            </Badge>
          </motion.div>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto mt-7 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.03em] sm:text-6xl lg:text-[80px]"
          >
            Find the creators shaping the <span className="text-gradient">future of content.</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Discover AI-native filmmakers, animators, designers and creative professionals.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/creators" size="lg">
              Explore Creators <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/briefs/create" variant="outline" size="lg">
              Post a Brief
            </Button>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mt-16 flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {CREATORS.slice(0, 5).map((c) => (
                <SmartImage key={c.id} src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full border-2 border-ink-950" />
              ))}
            </div>
            <p className="text-left text-sm text-muted">
              <span className="font-medium text-white">2,400+ verified creators</span>
              <br />
              using Runway, Sora, Kling, Midjourney & more
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-ink-900/60">
        <div className="container-x grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {STATS.map(([v, l], i) => (
            <motion.div key={l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <p className="text-3xl font-semibold tracking-tight">{v}</p>
              <p className="mt-1 text-sm text-muted">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured creators */}
      <section className="container-x py-24">
        <SectionHeader
          eyebrow="Featured creators"
          title="Hand-picked, verified talent"
          description="Every featured creator has a verified portfolio, proven tool experience and a documented workflow."
          action={
            <Button href="/creators" variant="outline" size="sm">
              View all creators <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
        {featured.loading && <CardGridSkeleton count={6} />}
        {featured.error && <ErrorState message={featured.error} onRetry={featured.reload} />}
        {featured.data && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.data.data.map((c, i) => (
              <CreatorCard key={c.id} creator={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Trending work */}
      <section id="trending" className="scroll-mt-20 border-t border-line bg-ink-900/40 py-24">
        <div className="container-x">
          <SectionHeader eyebrow="Trending work" title="What AI creators are making now" description="From cinematic launch films to photoreal product campaigns." />
          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {TRENDING.map((t, i) => {
              const item = PORTFOLIO.find((p) => p.id === t.id)!;
              const Icon = contentIcon[item.contentType];
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  onClick={() => setActive(item)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-line text-left ${t.span}`}
                >
                  <SmartImage src={item.thumbnail} alt={item.title} className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="border-white/15 bg-black/40 text-white backdrop-blur">
                      <Icon className="h-3 w-3" /> {t.label}
                    </Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <div>
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className="text-xs text-zinc-300">by {creatorName(item.creatorId)}</p>
                    </div>
                    <span className="flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-x scroll-mt-20 py-24">
        <SectionHeader eyebrow="How it works" title="From brief to final cut in three steps" className="md:justify-center md:text-center [&>div]:mx-auto" />
        <div className="relative grid gap-5 md:grid-cols-3">
          <div className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-violet/0 via-purple/40 to-cyan/0 md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="surface relative p-7 text-center"
            >
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple/30 bg-gradient-to-br from-violet/25 to-cyan/10">
                <s.icon className="h-6 w-6 text-violet-200" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
          {['Portfolio Verified', 'Tool Experience Verified', 'Workflow Verified', 'Commercial rights clarity'].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-cyan" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 py-20 text-center"
        >
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="absolute top-1/2 left-1/2 h-[380px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/25 blur-[110px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">Your next creative partner is already here.</h2>
            <p className="mx-auto mt-4 max-w-md text-muted">Browse verified AI creators or post a brief and let the talent come to you.</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mt-9 inline-block">
              <Button href="/creators" size="lg">
                Explore Creators <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <PortfolioModal item={active} onClose={() => setActive(null)} creatorName={active ? creatorName(active.creatorId) : undefined} />
    </>
  );
}
