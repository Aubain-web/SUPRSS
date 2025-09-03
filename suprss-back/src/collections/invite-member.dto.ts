import { IsString, IsArray, IsEnum } from 'class-validator';
import { Permission } from './collection-members';

export class InviteMemberDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}
