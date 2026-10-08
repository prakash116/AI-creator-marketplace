'use client';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { contentIcon } from '@/components/PortfolioCard';
import { SmartImage } from '@/components/SmartImage';
import { CONTENT_TYPES, CREATORS, SKILLS } from '@/data/seed';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import type { Brief, ContentType } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, Loader2, Rocket, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';

const ASPECTS = [
  { value: '16:9', w: 32, h: 18 },
  { value: '9:16', w: 14, h: 24 },
  { value: '1:1', w: 22, h: 22 },
  { value: '4:5', w: 19, h: 24 },
];
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Website', 'Advertising'];
const LICENSES: { value: Brief['commercialUse']; desc: string }[] = [
  { value: 'Personal', desc: 'Non-commercial, portfolio or personal use only.' },
  { value: 'Commercial', desc: 'Organic social and owned channels.' },
  { value: 'Full commercial rights', desc: 'Paid media, broadcast and buyout of rights.' },
];
const BUDGETS = ['$500 – $1,500', '$1,500 – $3,000', '$3,000 – $6,000', '$6,000 – $10,000', '$10,000+'];

interface FormState {
  title: string;
  brandName: string;
  description: string;
  contentType: ContentType | '';
  style: string;
  mood: string;
  reference: string;
  visualDirection: string;
  aspectRatio: string;
  platform: string[];
  commercialUse: Brief['commercialUse'] | '';
  budget: string;
  startDate: string;
  deadline: string;
  requiredSkills: string[];
}

type Errors = Partial<Record<keyof FormState, string>>;

const today = () => new Date().toISOString().slice(0, 10);

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 4) e.title = 'Project name must be at least 4 characters.';
  if (!f.brandName.trim()) e.brandName = 'Brand name is required.';
  if (f.description.trim().length < 20) e.description = 'Describe the project in at least 20 characters.';
  if (!f.contentType) e.contentType = 'Choose a content type.';
  if (!f.aspectRatio) e.aspectRatio = 'Choose an aspect ratio.';
  if (f.platform.length === 0) e.platform = 'Select at least one platform.';
  if (!f.commercialUse) e.commercialUse = 'Choose a license requirement.';
  if (!f.budget) e.budget = 'Select a budget range.';
  if (!f.deadline) e.deadline = 'Delivery date is required.';
  else if (f.deadline < today()) e.deadline = 'Delivery date cannot be in the past.';
  else if (f.startDate && f.deadline < f.startDate) e.deadline = 'Delivery date must be after the start date.';
  return e;
}

function Card({ step, title, description, children }: { step: number; title: string; description: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: step * 0.05 }} className="surface p-6 md:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple/40 bg-purple/10 text-sm font-semibold text-violet-200">{step}</span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-red-400">
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition',
        active ? 'border-purple/60 bg-purple/15 text-white' : 'border-line text-muted hover:border-white/20 hover:text-white',
      )}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function CreateBriefForm() {
  const params = useSearchParams();
  const invitedId = params.get('creator') ?? undefined;
  const invited = CREATORS.find((c) => c.id === invitedId);
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState<FormState>({
    title: '',
    brandName: '',
    description: '',
    contentType: '',
    style: '',
    mood: '',
    reference: '',
    visualDirection: '',
    aspectRatio: '16:9',
    platform: [],
    commercialUse: '',
    budget: '',
    startDate: today(),
    deadline: '',
    requiredSkills: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Brief | null>(null);

  useEffect(() => {
    if (user?.role === 'brand') setForm((f) => (f.brandName ? f : { ...f, brandName: user.name }));
  }, [user]);

  useEffect(() => {
    if (invited) {
      setForm((f) => ({
        ...f,
        contentType: f.contentType || invited.contentTypes[0],
        requiredSkills: f.requiredSkills.length ? f.requiredSkills : invited.skills.slice(0, 3),
      }));
    }
  }, [invited]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const toggleIn = (key: 'platform' | 'requiredSkills', v: string) =>
    set(key, form[key].includes(v) ? form[key].filter((x) => x !== v) : [...form[key], v]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields', `${Object.keys(errs).length} field(s) need attention.`);
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const brief = await api.createBrief({
        title: form.title.trim(),
        brandName: form.brandName.trim(),
        description: form.description.trim(),
        contentType: form.contentType as ContentType,
        style: form.style.trim() || 'Open to interpretation',
        mood: form.mood.trim() || undefined,
        reference: form.reference.trim() || undefined,
        visualDirection: form.visualDirection.trim() || undefined,
        aspectRatio: form.aspectRatio,
        platform: form.platform,
        commercialUse: form.commercialUse as Brief['commercialUse'],
        budget: form.budget,
        startDate: form.startDate || undefined,
        deadline: form.deadline,
        requiredSkills: form.requiredSkills,
        invitedCreatorId: invited?.id,
      });
      setCreated(brief);
      toast.success('Brief published', invited ? `${invited.name} has been invited.` : 'Creators can now apply.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Could not publish brief', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="container-x flex min-h-[80vh] items-center justify-center pt-24 pb-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }} className="surface relative w-full max-w-xl overflow-hidden p-10 text-center">
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-success/20 blur-[80px]" />
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.15, damping: 12 }} className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-9 w-9" />
          </motion.div>
          <h1 className="relative mt-6 text-3xl font-semibold tracking-tight">Your brief is live.</h1>
          <p className="mt-2 text-muted">
            <span className="text-white">{created.title}</span> is now visible to verified creators
            {invited ? (
              <>
                {' '}
                and <span className="text-white">{invited.name}</span> has been invited
              </>
            ) : null}
            .
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-line bg-white/[0.02] p-4 text-left text-xs">
            <div>
              <p className="text-subtle">Content</p>
              <p className="mt-0.5 font-medium">{created.contentType}</p>
            </div>
            <div>
              <p className="text-subtle">Budget</p>
              <p className="mt-0.5 font-medium">{created.budget}</p>
            </div>
            <div>
              <p className="text-subtle">Delivery</p>
              <p className="mt-0.5 font-medium">{formatDate(created.deadline)}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button href={`/briefs?highlight=${created.id}`}>
              View on Briefs <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={`/briefs/${created.id}`} variant="outline">
              Open brief
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-x max-w-4xl pt-28 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Badge tone="violet">
          <Rocket className="h-3 w-3" /> New project
        </Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Create a Creative Brief</h1>
        <p className="mt-3 text-muted">Clear briefs get 3× more qualified proposals. It takes about 3 minutes.</p>
      </motion.div>

      {invited && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center gap-4 rounded-2xl border border-purple/30 bg-purple/[0.07] p-4">
          <SmartImage src={invited.avatar} alt={invited.name} className="h-12 w-12 rounded-xl" />
          <div className="flex-1">
            <p className="text-sm">
              Inviting <span className="font-semibold">{invited.name}</span> to this brief
            </p>
            <p className="text-xs text-muted">{invited.specialization.join(' · ')} — they&apos;ll be notified when you publish.</p>
          </div>
          <Send className="h-5 w-5 text-purple" />
        </motion.div>
      )}

      <form onSubmit={submit} noValidate className="mt-8 space-y-6">
        <Card step={1} title="Project Information" description="The essentials creators see first.">
          <div className="grid gap-5 md:grid-cols-2">
            <div data-error={!!errors.title}>
              <label className="label" htmlFor="title">Project name *</label>
              <input id="title" className={cn('field', errors.title && 'border-red-500/60')} placeholder="e.g. Summer Launch Film" value={form.title} onChange={(e) => set('title', e.target.value)} />
              <FieldError msg={errors.title} />
            </div>
            <div data-error={!!errors.brandName}>
              <label className="label" htmlFor="brand">Brand name *</label>
              <input id="brand" className={cn('field', errors.brandName && 'border-red-500/60')} placeholder="e.g. Volt Motors" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
              <FieldError msg={errors.brandName} />
            </div>
          </div>
          <div data-error={!!errors.description}>
            <label className="label" htmlFor="desc">Description *</label>
            <textarea
              id="desc"
              rows={4}
              className={cn('field resize-none', errors.description && 'border-red-500/60')}
              placeholder="What are you making, who is it for, and what should it achieve?"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <div className="flex justify-between">
              <FieldError msg={errors.description} />
              <span className="mt-1.5 ml-auto text-xs text-subtle">{form.description.length} chars</span>
            </div>
          </div>
        </Card>

        <Card step={2} title="Content" description="What type of content do you need?">
          <div data-error={!!errors.contentType} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CONTENT_TYPES.map((c) => {
              const Icon = contentIcon[c];
              const active = form.contentType === c;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => set('contentType', c)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 text-sm transition',
                    active ? 'border-purple/60 bg-purple/10 text-white' : 'border-line text-muted hover:border-white/20 hover:text-white',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-purple')} />
                  {c}
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.contentType} />
          <div>
            <p className="label">Required skills</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <Chip key={s.id} active={form.requiredSkills.includes(s.name)} onClick={() => toggleIn('requiredSkills', s.name)}>
                  {s.name}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        <Card step={3} title="Creative Direction" description="Help creators understand the look and feel.">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="style">Style</label>
              <input id="style" className="field" placeholder="e.g. Cinematic, Editorial, Anime" value={form.style} onChange={(e) => set('style', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="mood">Mood</label>
              <input id="mood" className="field" placeholder="e.g. Optimistic, moody, energetic" value={form.mood} onChange={(e) => set('mood', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="ref">Reference</label>
            <input id="ref" className="field" placeholder="Links to reference films, moodboards or creators" value={form.reference} onChange={(e) => set('reference', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="vd">Visual direction</label>
            <textarea id="vd" rows={3} className="field resize-none" placeholder="Color palette, camera movement, lighting, typography…" value={form.visualDirection} onChange={(e) => set('visualDirection', e.target.value)} />
          </div>
        </Card>

        <Card step={4} title="Format" description="Where will this content live?">
          <div data-error={!!errors.aspectRatio}>
            <p className="label">Aspect ratio *</p>
            <div className="grid grid-cols-4 gap-3">
              {ASPECTS.map((a) => {
                const active = form.aspectRatio === a.value;
                return (
                  <button
                    type="button"
                    key={a.value}
                    onClick={() => set('aspectRatio', a.value)}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-3 rounded-xl border py-4 text-sm transition',
                      active ? 'border-purple/60 bg-purple/10 text-white' : 'border-line text-muted hover:border-white/20',
                    )}
                  >
                    <span className="flex h-7 items-center">
                      <span style={{ width: a.w, height: a.h }} className={cn('rounded-[3px] border-2', active ? 'border-purple' : 'border-white/30')} />
                    </span>
                    {a.value}
                  </button>
                );
              })}
            </div>
            <FieldError msg={errors.aspectRatio} />
          </div>
          <div data-error={!!errors.platform}>
            <p className="label">Platform *</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <Chip key={p} active={form.platform.includes(p)} onClick={() => toggleIn('platform', p)}>
                  {p}
                </Chip>
              ))}
            </div>
            <FieldError msg={errors.platform} />
          </div>
        </Card>

        <Card step={5} title="Commercial Usage" description="Set clear usage rights up front.">
          <div data-error={!!errors.commercialUse} className="grid gap-3 md:grid-cols-3">
            {LICENSES.map((l) => {
              const active = form.commercialUse === l.value;
              return (
                <button
                  type="button"
                  key={l.value}
                  onClick={() => set('commercialUse', l.value)}
                  className={cn(
                    'cursor-pointer rounded-xl border p-4 text-left transition',
                    active ? 'border-purple/60 bg-purple/10' : 'border-line hover:border-white/20',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{l.value}</p>
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', active ? 'border-purple bg-purple' : 'border-white/30')}>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{l.desc}</p>
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.commercialUse} />
        </Card>

        <Card step={6} title="Budget & Timeline" description="Realistic budgets attract top-rated creators.">
          <div data-error={!!errors.budget}>
            <p className="label">Budget range *</p>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <Chip key={b} active={form.budget === b} onClick={() => set('budget', b)}>
                  {b}
                </Chip>
              ))}
            </div>
            <FieldError msg={errors.budget} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="start">Start date</label>
              <input id="start" type="date" min={today()} className="field" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div data-error={!!errors.deadline}>
              <label className="label" htmlFor="deadline">Delivery date *</label>
              <input
                id="deadline"
                type="date"
                min={form.startDate || today()}
                className={cn('field', errors.deadline && 'border-red-500/60')}
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
              />
              <FieldError msg={errors.deadline} />
            </div>
          </div>
        </Card>

        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-line-strong bg-card-2/90 p-4 backdrop-blur-xl">
          <p className="hidden text-sm text-muted sm:block">Your brief will be visible to verified creators immediately.</p>
          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Publishing…
              </>
            ) : (
              <>
                Publish Brief <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateBriefPage() {
  return (
    <Suspense fallback={null}>
      <CreateBriefForm />
    </Suspense>
  );
}
