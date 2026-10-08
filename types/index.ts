export * from '@/data/seed';

export type Role = 'creator' | 'brand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  creatorId?: string;
}

export interface CreatorFilters {
  search: string;
  specialization: string[];
  skill: string[];
  tool: string[];
  contentType: string[];
  location: string[];
  experience: string[];
  verified: boolean;
  sort: 'relevance' | 'rating' | 'experience';
}
