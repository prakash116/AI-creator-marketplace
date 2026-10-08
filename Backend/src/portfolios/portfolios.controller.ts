import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload, PortfolioEntity } from '../common/types';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfoliosService } from './portfolios.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfolios: PortfoliosService) {}

  @Get()
  list(
    @Query('creatorId') creatorId?: string,
    @Query('contentType') contentType?: string,
    @Query('limit') limit?: string,
  ): Promise<PortfolioEntity[]> {
    return this.portfolios.list({ creatorId, contentType, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PortfolioEntity> {
    return this.portfolios.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePortfolioDto): Promise<PortfolioEntity> {
    return this.portfolios.create(user, dto);
  }
}
