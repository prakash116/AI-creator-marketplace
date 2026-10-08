import { Brief, Creator, PortfolioItem, Skill, Tool, VerificationSignal } from '../seed/seed-data';

export type UserRole = 'creator' | 'brand';

/** Persisted user record (never returned as-is: passwordHash is stripped). */
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  creatorId?: string;
  createdAt: string;
}

export type PublicUser = Omit<UserEntity, 'passwordHash'>;

/** Creator profile as stored (portfolio lives in its own collection). */
export type CreatorEntity = Omit<Creator, 'portfolio'>;
export type PortfolioEntity = PortfolioItem;
export type BriefEntity = Brief;
export type SkillEntity = Skill;
export type ToolEntity = Tool;

export interface VerificationEntity {
  /** Same as creatorId. */
  id: string;
  creatorId: string;
  verified: boolean;
  signals: VerificationSignal[];
}

/** Payload stored in issued JWTs and attached to request.user. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  creatorId?: string;
}

export function toPublicUser(user: UserEntity): PublicUser {
  const { passwordHash: _hash, ...rest } = user;
  return rest;
}
