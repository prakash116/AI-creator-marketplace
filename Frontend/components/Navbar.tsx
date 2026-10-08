'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn, initials } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './Button';

const links = [
  { href: '/#trending', label: 'Discover' },
  { href: '/creators', label: 'Creators' },
  { href: '/briefs', label: 'Briefs' },
  { href: '/#how-it-works', label: 'How it works' },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet via-purple to-cyan">
        <span className="h-2.5 w-2.5 rounded-sm bg-black/80 transition-transform duration-500 group-hover:rotate-45" />
      </span>
      <span className="text-[17px]">
        CRE<span className="text-purple">8</span>R
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname?.startsWith('/dashboard')) return null;

  const isActive = (href: string) => !href.includes('#') && pathname?.startsWith(href);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'border-b border-line bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm transition-colors',
                    isActive(l.href) ? 'bg-white/[0.06] text-white' : 'text-muted hover:text-white',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button href="/dashboard" variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-xs font-semibold" title={user.name}>
                {initials(user.name)}
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="cursor-pointer rounded-full p-2 text-muted transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button className="cursor-pointer rounded-lg p-2 text-muted md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {links.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/[0.04] hover:text-white">
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-2">
                {user ? (
                  <>
                    <Button href="/dashboard" variant="outline" size="sm" className="flex-1">
                      Dashboard
                    </Button>
                    <Button variant="ghost" size="sm" onClick={logout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" size="sm" className="flex-1">
                      Log in
                    </Button>
                    <Button href="/register" size="sm" className="flex-1">
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
