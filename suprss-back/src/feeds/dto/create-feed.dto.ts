import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateFeedDto {
  @IsString()
  title!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(60)
  updateFrequency?: number; // en secondes (>= 60)

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  collectionId?: string;
}
