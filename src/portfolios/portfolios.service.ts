import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { parseLimit, splitParam } from '../common/ids';
import { CreatorEntity, JwtPayload, PortfolioEntity, UserEntity } from '../common/types';
import { Repository } from '../database/repository';
import { CREATOR_REPOSITORY, PORTFOLIO_REPOSITORY, USER_REPOSITORY } from '../database/tokens';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

@Injectable()
export class PortfoliosService {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY) private readonly portfolio: Repository<PortfolioEntity>,
    @Inject(CREATOR_REPOSITORY) private readonly creators: Repository<CreatorEntity>,
    @Inject(USER_REPOSITORY) private readonly users: Repository<UserEntity>,
  ) {}

  async list(q: { creatorId?: string; contentType?: string; limit?: string }): Promise<PortfolioEntity[]> {
    const items = await this.portfolio.findAll(q.creatorId ? { creatorId: q.creatorId } : undefined);
    const types = splitParam(q.contentType);
    const filtered = types.length ? items.filter((i) => types.includes(i.contentType.toLowerCase())) : items;
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = parseLimit(q.limit);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async findOne(id: string): Promise<PortfolioEntity> {
    const item = await this.portfolio.findById(id);
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async create(user: JwtPayload, dto: CreatePortfolioDto): Promise<PortfolioEntity> {
    const account = await this.users.findById(user.sub);
    const creatorId = dto.creatorId ?? account?.creatorId;
    if (!creatorId) throw new BadRequestException('creatorId is required (no creator profile linked to this account)');

    const creator = await this.creators.findById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');
    if (creator.userId && creator.userId !== user.sub) {
      throw new ForbiddenException('You can only add items to your own portfolio');
    }

    return this.portfolio.create({
      creatorId,
      title: dto.title,
      description: dto.description ?? '',
      mediaUrl: dto.mediaUrl,
      thumbnail: dto.thumbnail ?? dto.mediaUrl,
      contentType: dto.contentType,
      tools: dto.tools ?? [],
      tags: dto.tags ?? [],
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    });
  }
}
