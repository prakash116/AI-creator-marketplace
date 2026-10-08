'use client';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fill = (role: 'brand' | 'creator') => {
    setEmail(`${role}@cre8r.dev`);
    setPassword('password123');
    setError('');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage briefs, creators and projects.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="field" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-line bg-white/[0.02] p-4">
        <p className="text-xs text-muted">Demo accounts (password: password123)</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => fill('brand')}>
            Brand demo
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => fill('creator')}>
            Creator demo
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        New to CRE8R?{' '}
        <Link href="/register" className="text-purple hover:text-violet-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
