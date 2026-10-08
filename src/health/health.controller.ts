import { Controller, Get } from '@nestjs/common';
import { DatabaseService, DbMode } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  check(): { status: 'ok'; db: DbMode } {
    return { status: 'ok', db: this.db.mode };
  }
}
