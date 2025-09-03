import { IsString, IsUrl, IsOptional, IsArray, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateFeedDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(300) // Minimum 5 minutes
  updateFrequency?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
