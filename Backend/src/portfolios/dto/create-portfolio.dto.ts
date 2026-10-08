import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { CONTENT_TYPES, ContentType } from '../../seed/seed-data';

export class CreatePortfolioDto {
  /** Defaults to the authenticated user's creator profile. */
  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsUrl({ require_tld: false })
  mediaUrl: string;

  /** Defaults to mediaUrl. */
  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnail?: string;

  @IsIn(CONTENT_TYPES)
  contentType: ContentType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tools?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  tags?: string[];
}
