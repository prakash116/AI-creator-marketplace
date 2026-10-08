import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '../common/ids';
import { CreatorEntity, JwtPayload, PortfolioEntity, VerificationEntity } from '../common/types';
import { Repository } from '../database/repository';
import { CREATOR_REPOSITORY, PORTFOLIO_REPOSITORY, VERIFICATION_REPOSITORY } from '../database/tokens';
import { Creator, VerificationSignal } from '../seed/seed-data';
import { UsersService } from '../users/users.service';
import { CreatorQuery, filterAndSortCreators } from './creator-query';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

export type CreatorListItem = CreatorEntity & { portfolioPreview: string[] };

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=1800&q=80';

const unverifiedSignals = (): VerificationSignal[] => [
  { type: 'identity', label: 'Identity Verified', verified: false },
  { type: 'portfolio', label: 'Portfolio Verified', verified: false },
  { type: 'tools', label: 'Tool Experience Verified', verified: false },
  { type: 'workflow', label: 'Workflow Verified', verified: false },
];

const byNewest = (a: PortfolioEntity, b: PortfolioEntity) => b.createdAt.localeCompare(a.createdAt);

@Injectable()
export class CreatorsService {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: Repository<CreatorEntity>,
    @Inject(PORTFOLIO_REPOSITORY) private readonly portfolio: Repository<PortfolioEntity>,
    @Inject(VERIFICATION_REPOSITORY) private readonly verifications: Repository<VerificationEntity>,
    private readonly users: UsersService,
  ) {}

  async list(query: CreatorQuery): Promise<{ data: CreatorListItem[]; total: number }> {
    const [all, items] = await Promise.all([this.creators.findAll(), this.portfolio.findAll()]);
    const { data, total } = filterAndSortCreators(all, query);

    const previews = new Map<string, string[]>();
    for (const item of [...items].sort(byNewest)) {
      const list = previews.get(item.creatorId) ?? [];
      if (list.length < 3) list.push(item.thumbnail);
      previews.set(item.creatorId, list);
    }
    return { data: data.map((c) => ({ ...c, portfolioPreview: previews.get(c.id) ?? [] })), total };
  }

  /** Lookup by id OR username. Returns null when missing. */
  async resolve(idOrUsername: string): Promise<CreatorEntity | null> {
    return (
      (await this.creators.findById(idOrUsername)) ??
      (await this.creators.findOne({ username: idOrUsername.toLowerCase() }))
    );
  }

  async findOne(idOrUsername: string): Promise<Creator> {
    const creator = await this.resolve(idOrUsername);
    if (!creator) throw new NotFoundException('Creator not found');
    const portfolio = (await this.portfolio.findAll({ creatorId: creator.id })).sort(byNewest);
    return { ...creator, portfolio };
  }

  private async uniqueUsername(base: string): Promise<string> {
    const root = slugify(base);
    let candidate = root;
    for (let i = 2; await this.creators.findOne({ username: candidate }); i++) {
      candidate = `${root}-${i}`;
    }
    return candidate;
  }

  /** Creates a profile linked to a user (used by POST /creators and creator registration). */
  async createForUser(userId: string, dto: CreateCreatorDto): Promise<CreatorEntity> {
    let username: string;
    if (dto.username) {
      username = dto.username.toLowerCase();
      if (await this.resolve(username)) throw new ConflictException('Username is already taken');
    } else {
      username = await this.uniqueUsername(dto.name);
    }

    const creator = await this.creators.create({
      userId,
      name: dto.name,
      username,
      avatar:
        dto.avatar ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.name)}&background=111827&color=ffffff&size=400`,
      cover: dto.cover ?? DEFAULT_COVER,
      headline: dto.headline ?? '',
      bio: dto.bio ?? '',
      location: dto.location ?? '',
      specialization: dto.specialization ?? [],
      focusAreas: dto.focusAreas ?? [],
      skills: dto.skills ?? [],
      tools: dto.tools ?? [],
      contentTypes: dto.contentTypes ?? [],
      experience: dto.experience ?? 0,
      rating: 0,
      reviews: 0,
      projectsCompleted: 0,
      hourlyRate: dto.hourlyRate ?? 0,
      availability: dto.availability ?? 'Available',
      responseTime: dto.responseTime ?? '< 24 hours',
      verified: false,
      verification: unverifiedSignals(),
      workflow: dto.workflow ?? [],
      featured: false,
    });

    await this.verifications.create({
      id: creator.id,
      creatorId: creator.id,
      verified: false,
      signals: creator.verification,
    });
    await this.users.setCreatorId(userId, creator.id);
    return creator;
  }

  async create(user: JwtPayload, dto: CreateCreatorDto): Promise<CreatorEntity> {
    const existing = await this.creators.findOne({ userId: user.sub });
    if (existing) throw new ConflictException('A creator profile already exists for this user');
    return this.createForUser(user.sub, dto);
  }

  async update(user: JwtPayload, idOrUsername: string, dto: UpdateCreatorDto): Promise<CreatorEntity> {
    const creator = await this.resolve(idOrUsername);
    if (!creator) throw new NotFoundException('Creator not found');
    if (creator.userId && creator.userId !== user.sub) {
      throw new ForbiddenException('You can only edit your own creator profile');
    }

    const patch: Partial<CreatorEntity> = { ...dto };
    if (dto.username && dto.username.toLowerCase() !== creator.username) {
      const username = dto.username.toLowerCase();
      if (await this.resolve(username)) throw new ConflictException('Username is already taken');
      patch.username = username;
    }
    return this.creators.update(creator.id, patch);
  }
}
