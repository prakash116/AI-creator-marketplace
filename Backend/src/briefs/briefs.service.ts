import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { splitParam } from '../common/ids';
import { BriefEntity, JwtPayload } from '../common/types';
import { Repository } from '../database/repository';
import { BRIEF_REPOSITORY } from '../database/tokens';
import { CreateBriefDto } from './dto/create-brief.dto';
import { UpdateBriefDto } from './dto/update-brief.dto';

@Injectable()
export class BriefsService {
  constructor(@Inject(BRIEF_REPOSITORY) private readonly briefs: Repository<BriefEntity>) {}

  async list(q: { search?: string; contentType?: string; status?: string }): Promise<BriefEntity[]> {
    const words = (q.search ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    const types = splitParam(q.contentType);
    const statuses = splitParam(q.status);

    const all = await this.briefs.findAll();
    return all
      .filter((b) => {
        if (types.length && !types.includes(b.contentType.toLowerCase())) return false;
        if (statuses.length && !statuses.includes(b.status.toLowerCase())) return false;
        if (words.length) {
          const text = [
            b.title,
            b.brandName,
            b.description,
            b.style,
            b.mood,
            b.contentType,
            ...(b.platform ?? []),
            ...(b.requiredSkills ?? []),
          ]
            .join(' ')
            .toLowerCase();
          if (!words.every((w) => text.includes(w))) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findOne(id: string): Promise<BriefEntity> {
    const brief = await this.briefs.findById(id);
    if (!brief) throw new NotFoundException('Brief not found');
    return brief;
  }

  create(user: JwtPayload | undefined, dto: CreateBriefDto): Promise<BriefEntity> {
    return this.briefs.create({
      ...dto,
      brandId: user?.sub,
      style: dto.style ?? '',
      platform: dto.platform ?? [],
      requiredSkills: dto.requiredSkills ?? [],
      applicants: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateBriefDto): Promise<BriefEntity> {
    const brief = await this.findOne(id);
    if (brief.brandId && brief.brandId !== user.sub) {
      throw new ForbiddenException('You can only edit your own briefs');
    }
    return this.briefs.update(id, dto);
  }

  async apply(id: string): Promise<BriefEntity> {
    await this.findOne(id);
    return this.briefs.increment(id, 'applicants', 1);
  }
}
