import { Controller, Get } from '@nestjs/common';
import { SkillEntity } from '../common/types';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  @Get()
  findAll(): Promise<SkillEntity[]> {
    return this.service.findAll();
  }
}
