import { IsString, IsUUID } from 'class-validator';
import { IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  collectionId: string;
}

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;
}
