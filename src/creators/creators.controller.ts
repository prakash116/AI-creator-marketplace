import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatorEntity, JwtPayload } from '../common/types';
import { Creator } from '../seed/seed-data';
import { CreatorQuery } from './creator-query';
import { CreatorListItem, CreatorsService } from './creators.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creators: CreatorsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('skill') skill?: string,
    @Query('tool') tool?: string,
    @Query('contentType') contentType?: string,
    @Query('location') location?: string,
    @Query('experience') experience?: string,
    @Query('verified') verified?: string,
    @Query('featured') featured?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: CreatorListItem[]; total: number }> {
    const query: CreatorQuery = {
      search,
      specialization,
      skill,
      tool,
      contentType,
      location,
      experience,
      verified,
      featured,
      sort,
      limit,
    };
    return this.creators.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Creator> {
    return this.creators.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCreatorDto): Promise<CreatorEntity> {
    return this.creators.create(user, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCreatorDto,
  ): Promise<CreatorEntity> {
    return this.creators.update(user, id, dto);
  }
}
