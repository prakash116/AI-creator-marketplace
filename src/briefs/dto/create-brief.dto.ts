import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Brief, CONTENT_TYPES, ContentType } from '../../seed/seed-data';

export const COMMERCIAL_USE: Brief['commercialUse'][] = ['Personal', 'Commercial', 'Full commercial rights'];

export class CreateBriefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  brandName: string;

  @IsOptional()
  @IsString()
  brandLogo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsIn(CONTENT_TYPES)
  contentType: ContentType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  aspectRatio: string;

  @IsIn(COMMERCIAL_USE)
  commercialUse: Brief['commercialUse'];

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  budget: string;

  @IsString()
  @IsNotEmpty()
  deadline: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  style?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  mood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  visualDirection?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  platform?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  invitedCreatorId?: string;
}
