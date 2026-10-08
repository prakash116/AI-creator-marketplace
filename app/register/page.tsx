'use client';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import { Building2, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const ROLES: { value: Role; title: string; desc: string; icon: typeof Sparkles }[] = [
  { value: 'creator', title: 'Creator', desc: 'Showcase work and win briefs', icon: Sparkles },
  { value: 'brand', title: 'Brand / Agency', desc: 'Hire AI-native talent', icon: Building2 },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'brand' as Role });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '', form: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Use at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() });
      toast.success('Account created', form.role === 'creator' ? 'Complete your profile to get discovered.' : 'Post your first brief to get started.');
      router.push(form.role === 'brand' ? '/briefs/create' : '/dashboard');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join the marketplace for AI-native creative work.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <p className="label">Account type</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => set('role', r.value)}
                className={cn(
                  'cursor-pointer rounded-xl border p-4 text-left transition',
                  form.role === r.value ? 'border-purple/60 bg-purple/10' : 'border-line hover:border-white/20',
                )}
              >
                <r.icon className={cn('h-5 w-5', form.role === r.value ? 'text-purple' : 'text-muted')} />
                <p className="mt-3 text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="name">{form.role === 'brand' ? 'Name or company' : 'Full name'}</label>
          <input id="name" className={cn('field', errors.name && 'border-red-500/60')} placeholder={form.role === 'brand' ? 'Northwind Studio' : 'Aarav Mehta'} value={form.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className={cn('field', errors.email && 'border-red-500/60')} placeholder="you@studio.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className={cn('field', errors.password && 'border-red-500/60')} placeholder="At least 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} />
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
        </div>
        {errors.form && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{errors.form}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-purple hover:text-violet-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
