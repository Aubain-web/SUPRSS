import { IsString, IsUUID } from 'class-validator';
import { IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  articleId: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
