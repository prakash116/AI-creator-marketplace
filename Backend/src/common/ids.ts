import { randomUUID } from 'crypto';

export const newId = (): string => randomUUID();

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'creator';

/** Split a comma-separated query param into trimmed, non-empty, lower-cased values. */
export const splitParam = (value?: string | string[]): string[] => {
  if (value === undefined || value === null) return [];
  const raw = Array.isArray(value) ? value.join(',') : String(value);
  return raw
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
};

export const parseLimit = (value?: string): number | undefined => {
  if (value === undefined || value === '') return undefined;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
