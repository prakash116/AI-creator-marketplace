import { parseLimit, splitParam } from '../common/ids';
import { CreatorEntity } from '../common/types';

/** Raw query params accepted by GET /api/creators (all optional strings). */
export interface CreatorQuery {
  search?: string;
  specialization?: string;
  skill?: string;
  tool?: string;
  contentType?: string;
  location?: string;
  experience?: string;
  verified?: string;
  featured?: string;
  sort?: string;
  limit?: string;
}

const EXPERIENCE_BUCKETS: Record<string, (years: number) => boolean> = {
  '0-2': (y) => y <= 2,
  '3-5': (y) => y >= 3 && y <= 5,
  '6-9': (y) => y >= 6 && y <= 9,
  '10+': (y) => y >= 10,
};

const lower = (v: string | undefined | null): string => (v ?? '').toLowerCase();

/** True when ANY wanted value is a case-insensitive substring of ANY field value. */
const anyMatch = (wanted: string[], values: string[]): boolean =>
  wanted.length === 0 || wanted.some((w) => values.some((v) => lower(v).includes(w)));

const parseBool = (value?: string): boolean | undefined => {
  if (value === undefined || value === '') return undefined;
  const v = value.toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return undefined;
};

const searchableText = (c: CreatorEntity): string =>
  [
    c.name,
    c.username,
    c.headline,
    c.location,
    ...(c.specialization ?? []),
    ...(c.focusAreas ?? []),
    ...(c.skills ?? []),
    ...(c.tools ?? []),
    ...(c.contentTypes ?? []),
  ]
    .join(' \u0001 ')
    .toLowerCase();

/** Rank boost used by relevance sort when a search term is present. */
const searchScore = (c: CreatorEntity, phrase: string, words: string[]): number => {
  if (!phrase) return 0;
  const name = lower(c.name);
  const username = lower(c.username);
  const specs = (c.specialization ?? []).map(lower);
  const headline = lower(c.headline);
  const secondary = [...(c.focusAreas ?? []), ...(c.skills ?? []), ...(c.tools ?? [])].map(lower);

  let score = 0;
  if (name.includes(phrase) || username.includes(phrase)) score += 100;
  if (specs.some((s) => s.includes(phrase))) score += 80;
  if (headline.includes(phrase)) score += 15;
  if (secondary.some((s) => s.includes(phrase))) score += 10;
  for (const w of words) {
    if (name.includes(w)) score += 20;
    if (specs.some((s) => s.includes(w))) score += 15;
    if (secondary.some((s) => s.includes(w))) score += 3;
  }
  return score;
};

/** Popularity/quality score: rating weighted by review volume. */
const baseScore = (c: CreatorEntity): number => (c.rating ?? 0) * Math.log10((c.reviews ?? 0) + 10);

/**
 * Pure filter + sort used by both storage modes.
 * Multi-valued params are comma-separated: ANY within a param, AND across params.
 */
export function filterAndSortCreators(
  creators: CreatorEntity[],
  q: CreatorQuery,
): { data: CreatorEntity[]; total: number } {
  const phrase = (q.search ?? '').trim().toLowerCase();
  const words = phrase.split(/\s+/).filter(Boolean);
  const specialization = splitParam(q.specialization);
  const skills = splitParam(q.skill);
  const tools = splitParam(q.tool);
  const contentTypes = splitParam(q.contentType);
  const locations = splitParam(q.location);
  const buckets = splitParam(q.experience)
    .map((b) => EXPERIENCE_BUCKETS[b.replace(/\s+/g, '')])
    .filter(Boolean);
  const verified = parseBool(q.verified);
  const featured = parseBool(q.featured);

  const filtered = creators.filter((c) => {
    if (words.length) {
      const text = searchableText(c);
      if (!words.every((w) => text.includes(w))) return false;
    }
    if (!anyMatch(specialization, c.specialization ?? [])) return false;
    if (!anyMatch(skills, c.skills ?? [])) return false;
    if (!anyMatch(tools, c.tools ?? [])) return false;
    if (!anyMatch(contentTypes, c.contentTypes ?? [])) return false;
    if (!anyMatch(locations, [c.location ?? ''])) return false;
    if (buckets.length && !buckets.some((fn) => fn(c.experience ?? 0))) return false;
    if (verified !== undefined && Boolean(c.verified) !== verified) return false;
    if (featured !== undefined && Boolean(c.featured) !== featured) return false;
    return true;
  });

  const sort = lower(q.sort) || 'relevance';
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'rating':
        return b.rating - a.rating || b.reviews - a.reviews || a.name.localeCompare(b.name);
      case 'experience':
        return b.experience - a.experience || b.rating - a.rating || a.name.localeCompare(b.name);
      case 'relevance':
      default:
        return (
          searchScore(b, phrase, words) - searchScore(a, phrase, words) ||
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          baseScore(b) - baseScore(a) ||
          a.name.localeCompare(b.name)
        );
    }
  });

  const limit = parseLimit(q.limit);
  return { data: limit ? sorted.slice(0, limit) : sorted, total: filtered.length };
}
