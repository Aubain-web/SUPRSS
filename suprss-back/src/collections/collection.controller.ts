import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CollectionMember, Permission } from './collection-members';
import { InviteMemberDto } from './invite-member.dto';
import { UpdateCollectionDto } from './update-collection.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Collection } from './collection.entity';
import { CollectionsService } from './collection.service';
import { CreateCollectionDto } from './create-collection.dto';
import { CurrentUser } from '../common/current-user';
import { User } from '../user/user.entity';

@ApiTags('collections')
@Controller('collections')
//@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({
    status: 201,
    description: 'The collection has been successfully created.',
    type: Collection,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionsService.create(createCollectionDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all collections for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all collections where user is owner or member.',
    type: [Collection],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: User): Promise<Collection[]> {
    return this.collectionsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collection by id' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the collection.',
    type: Collection,
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<Collection> {
    return this.collectionsService.findOne(id, user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get collection statistics' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return collection statistics.',
    schema: {
      type: 'object',
      properties: {
        totalFeeds: { type: 'number' },
        totalArticles: { type: 'number' },
        unreadArticles: { type: 'number' },
        totalMembers: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getStats(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{
    totalFeeds: number;
    totalArticles: number;
    unreadArticles: number;
    totalMembers: number;
  }> {
    return this.collectionsService.getCollectionStats(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The collection has been successfully updated.',
    type: Collection,
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionsService.update(id, updateCollectionDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'The collection has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only owner can delete.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.collectionsService.remove(id, user);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to join the collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully invited.',
    type: CollectionMember,
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Need admin permission.' })
  @ApiResponse({ status: 400, description: 'User already a member.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  inviteMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @CurrentUser() user: User,
  ): Promise<CollectionMember> {
    return this.collectionsService.inviteMember(id, inviteMemberDto, user);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a collection using an invite code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        inviteCode: { type: 'string', description: 'Invite code' },
      },
      required: ['inviteCode'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined the collection.',
    type: Collection,
  })
  @ApiResponse({ status: 400, description: 'Already a member.' })
  @ApiResponse({ status: 404, description: 'Invalid invite code.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  joinByInviteCode(
    @Body('inviteCode') inviteCode: string,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionsService.joinByInviteCode(inviteCode, user);
  }

  @Patch(':id/members/:memberId/permissions')
  @ApiOperation({ summary: 'Update member permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiParam({ name: 'memberId', description: 'Member ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(Permission),
          },
          description: 'Array of permissions',
        },
      },
      required: ['permissions'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Member permissions have been successfully updated.',
    type: CollectionMember,
  })
  @ApiResponse({ status: 404, description: 'Collection or member not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Need admin permission.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateMemberPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body('permissions') permissions: Permission[],
    @CurrentUser() user: User,
  ): Promise<CollectionMember> {
    return this.collectionsService.updateMemberPermissions(id, memberId, permissions, user);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiParam({ name: 'memberId', description: 'Member ID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Member has been successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Collection or member not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Need admin permission or cannot remove owner.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.collectionsService.removeMember(id, memberId, user);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave the collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Successfully left the collection.',
  })
  @ApiResponse({ status: 404, description: 'Collection not found or not a member.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner cannot leave.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  leaveCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.collectionsService.leaveCollection(id, user);
  }

  @Post(':id/regenerate-invite')
  @ApiOperation({ summary: 'Regenerate invite code for the collection' })
  @ApiParam({ name: 'id', description: 'Collection ID', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Invite code has been successfully regenerated.',
    schema: {
      type: 'object',
      properties: {
        inviteCode: { type: 'string', description: 'New invite code' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Need admin permission.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async regenerateInviteCode(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ inviteCode: string }> {
    const inviteCode = await this.collectionsService.regenerateInviteCode(id, user);
    return { inviteCode };
  }
}
