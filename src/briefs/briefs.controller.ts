import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { BriefEntity, JwtPayload } from '../common/types';
import { BriefsService } from './briefs.service';
import { CreateBriefDto } from './dto/create-brief.dto';
import { UpdateBriefDto } from './dto/update-brief.dto';

@Controller('briefs')
export class BriefsController {
  constructor(private readonly briefs: BriefsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('contentType') contentType?: string,
    @Query('status') status?: string,
  ): Promise<BriefEntity[]> {
    return this.briefs.list({ search, contentType, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BriefEntity> {
    return this.briefs.findOne(id);
  }

  /** Auth optional: a valid bearer token sets brandId, anonymous posting is allowed for the demo. */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@CurrentUser() user: JwtPayload | undefined, @Body() dto: CreateBriefDto): Promise<BriefEntity> {
    return this.briefs.create(user, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateBriefDto): Promise<BriefEntity> {
    return this.briefs.update(user, id, dto);
  }

  @Post(':id/apply')
  @HttpCode(200)
  apply(@Param('id') id: string): Promise<BriefEntity> {
    return this.briefs.apply(id);
  }
}
