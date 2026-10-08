import type { Creator, CreatorFilters } from '@/types';

/** Deterministic search/filter — mirrors the backend logic, used as offline fallback. */
const lc = (s: string) => s.toLowerCase();
const anyMatch = (haystack: string[], needles: string[]) =>
  needles.length === 0 || needles.some((n) => haystack.some((h) => lc(h).includes(lc(n))));

const inBucket = (years: number, bucket: string) => {
  if (bucket === '0-2') return years <= 2;
  if (bucket === '3-5') return years >= 3 && years <= 5;
  if (bucket === '6-9') return years >= 6 && years <= 9;
  if (bucket === '10+') return years >= 10;
  return true;
};

export function filterCreators(creators: Creator[], f: CreatorFilters) {
  const words = f.search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const scored = creators
    .filter((c) => {
      const corpus = [c.name, c.username, c.headline, c.location, ...c.specialization, ...c.focusAreas, ...c.skills, ...c.tools, ...c.contentTypes]
        .join(' ')
        .toLowerCase();
      if (words.length && !words.every((w) => corpus.includes(w))) return false;
      if (!anyMatch(c.specialization, f.specialization)) return false;
      if (!anyMatch(c.skills, f.skill)) return false;
      if (!anyMatch(c.tools, f.tool)) return false;
      if (!anyMatch(c.contentTypes, f.contentType)) return false;
      if (f.location.length && !f.location.includes(c.location)) return false;
      if (f.experience.length && !f.experience.some((b) => inBucket(c.experience, b))) return false;
      if (f.verified && !c.verified) return false;
      return true;
    })
    .map((c) => {
      let score = (c.featured ? 50 : 0) + c.rating * 10 + Math.log10(c.reviews + 1) * 5;
      const q = words.join(' ');
      if (q) {
        if (c.name.toLowerCase().includes(q)) score += 100;
        if (c.specialization.some((s) => s.toLowerCase().includes(q))) score += 60;
      }
      return { c, score };
    });

  if (f.sort === 'rating') scored.sort((a, b) => b.c.rating - a.c.rating || b.c.reviews - a.c.reviews);
  else if (f.sort === 'experience') scored.sort((a, b) => b.c.experience - a.c.experience);
  else scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.c);
}

export const emptyFilters = (): CreatorFilters => ({
  search: '',
  specialization: [],
  skill: [],
  tool: [],
  contentType: [],
  location: [],
  experience: [],
  verified: false,
  sort: 'relevance',
});
