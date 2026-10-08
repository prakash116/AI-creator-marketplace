import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Availability, CONTENT_TYPES, ContentType } from '../../seed/seed-data';

export class WorkflowStepDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  step: string;

  @IsString()
  @MaxLength(500)
  description: string;
}

/**
 * Editable creator profile fields. Server-managed fields (rating, reviews,
 * projectsCompleted, verified, verification, featured, userId) are not accepted.
 */
export class CreateCreatorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]{2,48}$/i, { message: 'username may only contain letters, numbers and dashes (2-48 chars)' })
  username?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  avatar?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cover?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  specialization?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  focusAreas?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  tools?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(CONTENT_TYPES, { each: true })
  contentTypes?: ContentType[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(60)
  experience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsIn(['Available', 'Limited', 'Booked'])
  availability?: Availability;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  responseTime?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  workflow?: WorkflowStepDto[];
}
