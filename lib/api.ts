import { BRIEFS, CREATORS, DEMO_USERS, PORTFOLIO, SKILLS, TOOLS } from '@/data/seed';
import { filterCreators } from '@/lib/filter';
import type { AuthUser, Brief, Creator, CreatorFilters, PortfolioItem, Role, Skill, Tool } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Thrown when the backend cannot be reached — callers fall back to local seed data. */
class OfflineError extends Error {}

const TOKEN_KEY = 'cre8r.token';
const LOCAL_BRIEFS_KEY = 'cre8r.localBriefs';

const safeStorage = {
  get(key: string) {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};

export const tokenStore = {
  get: () => safeStorage.get(TOKEN_KEY),
  set: (t: string | null) => safeStorage.set(TOKEN_KEY, t),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && !token.startsWith('offline.') ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new OfflineError('Backend unreachable');
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

/** Try the API; on network failure use the offline implementation. */
async function withFallback<T>(online: () => Promise<T>, offline: () => T | Promise<T>): Promise<T> {
  try {
    return await online();
  } catch (e) {
    if (e instanceof OfflineError) return offline();
    throw e;
  }
}

const toQuery = (f: Partial<CreatorFilters> & { limit?: number; featured?: boolean }) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      if (v.length) p.set(k, v.join(','));
    } else if (typeof v === 'boolean') {
      if (v) p.set(k, 'true');
    } else if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

const localBriefs = (): Brief[] => {
  try {
    return JSON.parse(safeStorage.get(LOCAL_BRIEFS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const withPortfolio = (c: Creator): Creator => ({ ...c, portfolio: PORTFOLIO.filter((p) => p.creatorId === c.id) });

export const api = {
  health: () => request<{ status: string; db: string }>('/health'),

  getCreators: (f: Partial<CreatorFilters> & { limit?: number; featured?: boolean } = {}) =>
    withFallback(
      () => request<{ data: Creator[]; total: number }>(`/creators${toQuery(f)}`),
      () => {
        let data = filterCreators(CREATORS, {
          search: '', specialization: [], skill: [], tool: [], contentType: [], location: [], experience: [], verified: false, sort: 'relevance',
          ...f,
        });
        if (f.featured) data = data.filter((c) => c.featured);
        if (f.limit) data = data.slice(0, f.limit);
        return { data, total: data.length };
      },
    ),

  getCreator: (id: string) =>
    withFallback(
      () => request<Creator>(`/creators/${encodeURIComponent(id)}`),
      () => {
        const c = CREATORS.find((x) => x.id === id || x.username === id);
        if (!c) throw new ApiError('Creator not found', 404);
        return withPortfolio(c);
      },
    ),

  getPortfolio: (params: { creatorId?: string; limit?: number } = {}) =>
    withFallback(
      () => request<PortfolioItem[]>(`/portfolios${toQuery(params as never)}`),
      () => {
        const items = PORTFOLIO.filter((p) => !params.creatorId || p.creatorId === params.creatorId);
        return params.limit ? items.slice(0, params.limit) : items;
      },
    ),

  getBriefs: () =>
    withFallback(
      () => request<Brief[]>('/briefs'),
      () => [...localBriefs(), ...BRIEFS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),

  getBrief: (id: string) =>
    withFallback(
      () => request<Brief>(`/briefs/${encodeURIComponent(id)}`),
      () => {
        const b = [...localBriefs(), ...BRIEFS].find((x) => x.id === id);
        if (!b) throw new ApiError('Brief not found', 404);
        return b;
      },
    ),

  createBrief: (input: Omit<Brief, 'id' | 'applicants' | 'status' | 'createdAt'>) =>
    withFallback(
      () => request<Brief>('/briefs', { method: 'POST', body: JSON.stringify(input) }),
      () => {
        const brief: Brief = { ...input, id: `local-${Date.now()}`, applicants: 0, status: 'open', createdAt: new Date().toISOString() };
        safeStorage.set(LOCAL_BRIEFS_KEY, JSON.stringify([brief, ...localBriefs()]));
        return brief;
      },
    ),

  applyToBrief: (id: string) =>
    withFallback(
      () => request<Brief>(`/briefs/${encodeURIComponent(id)}/apply`, { method: 'POST' }),
      () => {
        const b = [...localBriefs(), ...BRIEFS].find((x) => x.id === id);
        if (!b) throw new ApiError('Brief not found', 404);
        return { ...b, applicants: b.applicants + 1 };
      },
    ),

  getSkills: () => withFallback(() => request<Skill[]>('/skills'), () => SKILLS),
  getTools: () => withFallback(() => request<Tool[]>('/tools'), () => TOOLS),

  login: (email: string, password: string) =>
    withFallback(
      () => request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
      () => {
        const u = DEMO_USERS.find((d) => d.email === email.toLowerCase() && d.password === password);
        if (!u) throw new ApiError('Invalid email or password', 401);
        return {
          token: `offline.${u.email}`,
          user: { id: u.email, name: u.name, email: u.email, role: u.role, creatorId: 'creatorId' in u ? u.creatorId : undefined },
        };
      },
    ),

  register: (input: { name: string; email: string; password: string; role: Role }) =>
    withFallback(
      () => request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
      () => ({ token: `offline.${input.email}`, user: { id: input.email, name: input.name, email: input.email, role: input.role } }),
    ),
};
