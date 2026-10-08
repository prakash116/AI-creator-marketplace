import { Controller, Get } from '@nestjs/common';
import { ToolEntity } from '../common/types';
import { ToolsService } from './tools.service';

@Controller('tools')
export class ToolsController {
  constructor(private readonly service: ToolsService) {}

  @Get()
  findAll(): Promise<ToolEntity[]> {
    return this.service.findAll();
  }
}
