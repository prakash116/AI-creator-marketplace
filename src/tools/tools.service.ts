import { Inject, Injectable } from '@nestjs/common';
import { ToolEntity } from '../common/types';
import { Repository } from '../database/repository';
import { TOOL_REPOSITORY } from '../database/tokens';

@Injectable()
export class ToolsService {
  constructor(@Inject(TOOL_REPOSITORY) private readonly repo: Repository<ToolEntity>) {}

  async findAll(): Promise<ToolEntity[]> {
    // Seed (insertion) order is curated, so it is preserved.
    return this.repo.findAll();
  }
}
