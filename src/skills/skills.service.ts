import { Inject, Injectable } from '@nestjs/common';
import { SkillEntity } from '../common/types';
import { Repository } from '../database/repository';
import { SKILL_REPOSITORY } from '../database/tokens';

@Injectable()
export class SkillsService {
  constructor(@Inject(SKILL_REPOSITORY) private readonly repo: Repository<SkillEntity>) {}

  async findAll(): Promise<SkillEntity[]> {
    // Seed (insertion) order is curated, so it is preserved.
    return this.repo.findAll();
  }
}
