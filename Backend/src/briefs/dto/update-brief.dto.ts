import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { Brief } from '../../seed/seed-data';
import { CreateBriefDto } from './create-brief.dto';

export class UpdateBriefDto extends PartialType(CreateBriefDto) {
  @IsOptional()
  @IsIn(['open', 'in_review', 'closed'])
  status?: Brief['status'];
}
