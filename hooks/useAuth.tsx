'use client';

import { api, tokenStore } from '@/lib/api';
import type { AuthUser, Role } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  logout: () => void;
}

const USER_KEY = 'cre8r.user';
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw && tokenStore.get()) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((token: string, u: AuthUser) => {
    tokenStore.set(token);
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login(email, password);
    return persist(token, u);
  }, [persist]);

  const register = useCallback(async (input: { name: string; email: string; password: string; role: Role }) => {
    const { token, user: u } = await api.register(input);
    return persist(token, u);
  }, [persist]);

  const logout = useCallback(() => {
    tokenStore.set(null);
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
