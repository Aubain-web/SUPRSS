import { IsString, IsUrl, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsUrl()
  link: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsDateString()
  publishedAt: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsString()
  feedId: string;
}
