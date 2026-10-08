'use client';

import { Badge, VerifiedBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { EmptyState } from '@/components/EmptyState';
import { CardGridSkeleton } from '@/components/LoadingState';
import { Modal } from '@/components/Modal';
import { Logo } from '@/components/Navbar';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioModal } from '@/components/PortfolioModal';
import { SmartImage } from '@/components/SmartImage';
import { StatsCard } from '@/components/StatsCard';
import { CONTENT_TYPES, CREATORS, PORTFOLIO } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { cn, formatDate, initials } from '@/lib/utils';
import type { ContentType, PortfolioItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Bookmark,
  Briefcase,
  Eye,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

type Tab = 'overview' | 'profile' | 'portfolio' | 'briefs' | 'saved' | 'messages' | 'settings';

const NAV: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
  { id: 'briefs', label: 'My Briefs', icon: FileText },
  { id: 'saved', label: 'Saved Creators', icon: Bookmark },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ACTIVITY = [
  { who: 'Aarav Mehta', what: 'applied to', target: 'EV Launch Film — "Charge the City"', time: '12 min ago', avatar: CREATORS[0].avatar },
  { who: 'Sofia Laurent', what: 'viewed your brief', target: 'Winter Couture Lookbook', time: '1 h ago', avatar: CREATORS[1].avatar },
  { who: 'Kenji Watanabe', what: 'was shortlisted for', target: 'Product Hero Renders', time: '3 h ago', avatar: CREATORS[2].avatar },
  { who: 'Maya Okafor', what: 'sent you a message about', target: 'Animated Mascot Series', time: 'Yesterday', avatar: CREATORS[3].avatar },
  { who: 'Priya Raman', what: 'published new work', target: 'Brand Variations Engine', time: '2 days ago', avatar: CREATORS[5].avatar },
];

const THREADS = [
  { id: 1, creator: CREATORS[0], last: 'Happy to jump on a call tomorrow to walk through the treatment.', time: '12:40', unread: 2 },
  { id: 2, creator: CREATORS[3], last: 'Here is the first character turnaround for Crunch!', time: 'Yesterday', unread: 0 },
  { id: 3, creator: CREATORS[2], last: 'Renders will be ready by Friday.', time: 'Mon', unread: 0 },
];

const VIEWS = [32, 45, 38, 52, 61, 48, 70, 66, 82, 74, 91, 88, 97, 110];

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const briefs = useAsync(() => api.getBriefs(), []);
  const [saved, setSaved] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [thread, setThread] = useState(THREADS[0]);
  const [messages, setMessages] = useState<Record<number, { me: boolean; text: string }[]>>({
    1: [
      { me: false, text: 'Hi! Thanks for the invite to the Volt Motors brief.' },
      { me: true, text: 'Love your Neon Mumbai piece — could you do something similar at dusk?' },
      { me: false, text: 'Happy to jump on a call tomorrow to walk through the treatment.' },
    ],
    2: [{ me: false, text: 'Here is the first character turnaround for Crunch!' }],
    3: [{ me: false, text: 'Renders will be ready by Friday.' }],
  });
  const [draft, setDraft] = useState('');

  const isCreator = user?.role === 'creator';
  const me = CREATORS.find((c) => c.id === (user?.creatorId ?? 'aarav-mehta')) ?? CREATORS[0];

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem('cre8r.savedCreators') ?? '[]'));
    } catch {
      /* ignore */
    }
    setPortfolio(PORTFOLIO.filter((p) => p.creatorId === me.id));
  }, [me.id]);

  const go = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => ({ ...m, [thread.id]: [...(m[thread.id] ?? []), { me: true, text: draft.trim() }] }));
    setDraft('');
  };

  const myBriefs = briefs.data ?? [];
  const activeBriefs = myBriefs.filter((b) => b.status === 'open').length;
  const applications = myBriefs.reduce((s, b) => s + b.applicants, 0);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            className={cn(
              'relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
              tab === n.id ? 'text-white' : 'text-muted hover:bg-white/[0.03] hover:text-white',
            )}
          >
            {tab === n.id && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-line bg-white/[0.06]" />}
            <n.icon className="relative h-4 w-4" />
            <span className="relative">{n.label}</span>
            {n.id === 'messages' && <span className="relative ml-auto rounded-full bg-purple px-1.5 text-[10px] font-semibold">2</span>}
          </button>
        ))}
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-xs font-semibold">{initials(user?.name ?? 'Demo User')}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Demo workspace'}</p>
            <p className="truncate text-xs text-muted">{user ? (isCreator ? 'Creator' : 'Brand / Agency') : 'Not signed in'}</p>
          </div>
          {user ? (
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="cursor-pointer text-muted hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link href="/login" className="text-xs text-purple">
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-ink-900 lg:block">{Sidebar}</aside>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute inset-y-0 left-0 w-64 border-r border-line bg-ink-900">
              {Sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ink-950/80 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="cursor-pointer text-muted lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold">{NAV.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button href="/creators" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Find creators
            </Button>
            <Button href="/briefs/create" size="sm">
              <Plus className="h-4 w-4" /> New brief
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {ready && !user && (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-purple/30 bg-purple/[0.07] p-4 sm:flex-row sm:items-center">
              <p className="text-sm">You&apos;re viewing a demo workspace. Log in to save your activity.</p>
              <Button href="/login" size="sm" variant="outline">
                Log in
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Good to see you{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</h2>
                    <p className="mt-1 text-sm text-muted">Here&apos;s what happened across your workspace this month.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatsCard label="Profile Views" value="3,482" delta="+18.2%" icon={Eye} />
                    <StatsCard label="Portfolio Views" value="12.9k" delta="+24.6%" icon={ImageIcon} />
                    <StatsCard label="Active Briefs" value={String(activeBriefs || '—')} delta="+2" icon={Briefcase} />
                    <StatsCard label="Applications" value={String(applications || '—')} delta="+31" icon={Users} />
                    <StatsCard label="Shortlisted Creators" value={String(Math.max(saved.length, 6))} delta="+3" icon={Bookmark} />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <div className="surface p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Profile views</h3>
                          <p className="text-xs text-muted">Last 14 days</p>
                        </div>
                        <Badge tone="success">+18.2%</Badge>
                      </div>
                      <div className="mt-6 flex h-44 items-end gap-2">
                        {VIEWS.map((v, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${(v / 110) * 100}%` }}
                            transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
                            className="group relative flex-1 rounded-t-md bg-purple/70 transition-colors hover:bg-purple"
                          >
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-black opacity-0 transition group-hover:opacity-100">{v}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="surface p-6">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple" />
                        <h3 className="font-semibold">Recent activity</h3>
                      </div>
                      <ul className="mt-5 space-y-4">
                        {ACTIVITY.map((a, i) => (
                          <li key={i} className="flex gap-3">
                            <SmartImage src={a.avatar} alt={a.who} className="h-8 w-8 shrink-0 rounded-full" />
                            <div className="min-w-0 text-sm">
                              <p className="text-zinc-300">
                                <span className="font-medium text-white">{a.who}</span> {a.what} <span className="text-white">{a.target}</span>
                              </p>
                              <p className="text-xs text-subtle">{a.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'profile' && (
                <div className="surface overflow-hidden">
                  <div className="relative h-36">
                    <SmartImage src={me.cover} alt="" className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                  <div className="-mt-12 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-end gap-4">
                        <SmartImage src={me.avatar} alt={me.name} className="relative h-24 w-24 rounded-2xl border-4 border-card" />
                        <div>
                          <p className="flex items-center gap-1.5 text-xl font-semibold">
                            {isCreator ? me.name : user?.name ?? me.name} {me.verified && <VerifiedBadge />}
                          </p>
                          <p className="text-sm text-purple">{me.specialization.join(' · ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button href={`/creators/${me.id}`} variant="outline" size="sm">
                          View public profile
                        </Button>
                        <Button size="sm" onClick={() => toast.success('Profile saved')}>
                          Save changes
                        </Button>
                      </div>
                    </div>
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="label">Headline</label>
                        <input className="field" defaultValue={me.headline} />
                      </div>
                      <div>
                        <label className="label">Location</label>
                        <input className="field" defaultValue={me.location} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label">Bio</label>
                        <textarea className="field resize-none" rows={4} defaultValue={me.bio} />
                      </div>
                      <div>
                        <p className="label">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {me.skills.map((s) => (
                            <Badge key={s}>{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="label">AI tools</p>
                        <div className="flex flex-wrap gap-1.5">
                          {me.tools.map((t) => (
                            <Badge key={t} tone="violet">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'portfolio' && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-muted">{portfolio.length} published pieces</p>
                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                      <Upload className="h-4 w-4" /> Upload work
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {portfolio.map((p) => (
                      <PortfolioCard key={p.id} item={p} onOpen={setActiveItem} />
                    ))}
                  </div>
                </div>
              )}

              {tab === 'briefs' && (
                <div className="surface overflow-hidden">
                  {briefs.loading ? (
                    <div className="p-6">
                      <CardGridSkeleton count={2} />
                    </div>
                  ) : myBriefs.length === 0 ? (
                    <EmptyState title="No briefs yet" description="Post your first brief to start receiving applications." action={<Button href="/briefs/create">Create brief</Button>} />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="border-b border-line text-left text-xs text-muted">
                          <tr>
                            <th className="px-6 py-3 font-medium">Brief</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Budget</th>
                            <th className="px-6 py-3 font-medium">Deadline</th>
                            <th className="px-6 py-3 font-medium">Applicants</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myBriefs.map((b) => (
                            <tr key={b.id} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                              <td className="px-6 py-4">
                                <Link href={`/briefs/${b.id}`} className="font-medium hover:text-purple">
                                  {b.title}
                                </Link>
                                <p className="text-xs text-muted">{b.brandName}</p>
                              </td>
                              <td className="px-6 py-4 text-muted">{b.contentType}</td>
                              <td className="px-6 py-4 text-muted">{b.budget}</td>
                              <td className="px-6 py-4 text-muted">{formatDate(b.deadline)}</td>
                              <td className="px-6 py-4">{b.applicants}</td>
                              <td className="px-6 py-4">
                                <Badge tone="success">Open</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'saved' &&
                (saved.length === 0 ? (
                  <EmptyState
                    icon={<Bookmark className="h-6 w-6" />}
                    title="No saved creators yet"
                    description="Tap the heart on any creator profile to shortlist them here."
                    action={<Button href="/creators">Discover creators</Button>}
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {CREATORS.filter((c) => saved.includes(c.id)).map((c, i) => (
                      <CreatorCard key={c.id} creator={c} index={i} />
                    ))}
                  </div>
                ))}

              {tab === 'messages' && (
                <div className="surface grid h-[600px] overflow-hidden md:grid-cols-[280px_1fr]">
                  <ul className="hidden border-r border-line md:block">
                    {THREADS.map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => setThread(t)}
                          className={cn('flex w-full cursor-pointer gap-3 border-b border-line p-4 text-left transition', thread.id === t.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]')}
                        >
                          <SmartImage src={t.creator.avatar} alt={t.creator.name} className="h-10 w-10 shrink-0 rounded-full" />
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">{t.creator.name}</p>
                              <span className="text-[11px] text-subtle">{t.time}</span>
                            </div>
                            <p className="truncate text-xs text-muted">{(messages[t.id] ?? []).at(-1)?.text ?? t.last}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex min-h-0 flex-col">
                    <div className="flex items-center gap-3 border-b border-line p-4">
                      <SmartImage src={thread.creator.avatar} alt={thread.creator.name} className="h-9 w-9 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{thread.creator.name}</p>
                        <p className="text-xs text-success">Online</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                      {(messages[thread.id] ?? []).map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.me ? 'ml-auto bg-purple text-white' : 'bg-card-2 text-zinc-200')}
                        >
                          {m.text}
                        </motion.div>
                      ))}
                    </div>
                    <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className="field" />
                      <Button type="submit" aria-label="Send">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {tab === 'settings' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Settings saved');
                  }}
                  className="surface max-w-2xl space-y-6 p-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">Name</label>
                      <input className="field" defaultValue={user?.name ?? 'Demo User'} />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className="field" type="email" defaultValue={user?.email ?? 'demo@cre8r.dev'} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="label">Notifications</p>
                    {['New applications on my briefs', 'Messages from creators', 'Weekly creator recommendations'].map((n, i) => (
                      <label key={n} className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm">
                        {n}
                        <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 accent-purple-500" />
                      </label>
                    ))}
                  </div>
                  <Button type="submit">Save settings</Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <PortfolioModal item={activeItem} onClose={() => setActiveItem(null)} creatorName={me.name} />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={(item) => {
          setPortfolio((p) => [{ ...item, creatorId: me.id }, ...p]);
          toast.success('Work published', 'Your portfolio has been updated.');
        }}
      />
    </div>
  );
}

function UploadModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (p: PortfolioItem) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ContentType>('Image');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    if (!/^https?:\/\//.test(url)) return setError('Enter a valid media URL (Cloudinary, Unsplash, etc).');
    onAdd({
      id: `local-${Date.now()}`,
      creatorId: '',
      title: title.trim(),
      description: 'Newly uploaded work.',
      thumbnail: url,
      mediaUrl: url,
      contentType: type,
      tools: [],
      tags: [],
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setUrl('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">Upload work</h3>
          <p className="text-xs text-muted">Media is stored via Cloudinary when configured; paste a hosted URL for now.</p>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Neon Mumbai — Director's cut" />
        </div>
        <div>
          <label className="label">Media URL</label>
          <input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/…" />
        </div>
        <div>
          <p className="label">Content type</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setType(c)}
                className={cn('cursor-pointer rounded-full border px-3 py-1.5 text-xs', type === c ? 'border-purple/60 bg-purple/15' : 'border-line text-muted')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit">
            <Upload className="h-4 w-4" /> Publish
          </Button>
        </div>
      </form>
    </Modal>
  );
}
