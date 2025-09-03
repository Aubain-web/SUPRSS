"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const collection_members_1 = require("./collection-members");
const invite_member_dto_1 = require("./invite-member.dto");
const update_collection_dto_1 = require("./update-collection.dto");
const swagger_2 = require("@nestjs/swagger");
const collection_entity_1 = require("./collection.entity");
const collection_service_1 = require("./collection.service");
const create_collection_dto_1 = require("./create-collection.dto");
const current_user_1 = require("../common/current-user");
const user_entity_1 = require("../user/user.entity");
let CollectionsController = class CollectionsController {
    collectionsService;
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    create(createCollectionDto, user) {
        return this.collectionsService.create(createCollectionDto, user);
    }
    findAll(user) {
        return this.collectionsService.findAll(user);
    }
    findOne(id, user) {
        return this.collectionsService.findOne(id, user);
    }
    getStats(id, user) {
        return this.collectionsService.getCollectionStats(id, user);
    }
    update(id, updateCollectionDto, user) {
        return this.collectionsService.update(id, updateCollectionDto, user);
    }
    remove(id, user) {
        return this.collectionsService.remove(id, user);
    }
    inviteMember(id, inviteMemberDto, user) {
        return this.collectionsService.inviteMember(id, inviteMemberDto, user);
    }
    joinByInviteCode(inviteCode, user) {
        return this.collectionsService.joinByInviteCode(inviteCode, user);
    }
    updateMemberPermissions(id, memberId, permissions, user) {
        return this.collectionsService.updateMemberPermissions(id, memberId, permissions, user);
    }
    removeMember(id, memberId, user) {
        return this.collectionsService.removeMember(id, memberId, user);
    }
    leaveCollection(id, user) {
        return this.collectionsService.leaveCollection(id, user);
    }
    async regenerateInviteCode(id, user) {
        const inviteCode = await this.collectionsService.regenerateInviteCode(id, user);
        return { inviteCode };
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_2.ApiOperation)({ summary: 'Create a new collection' }),
    (0, swagger_2.ApiResponse)({
        status: 201,
        description: 'The collection has been successfully created.',
        type: collection_entity_1.Collection,
    }),
    (0, swagger_2.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_2.ApiOperation)({ summary: 'Get all collections for the current user' }),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'Return all collections where user is owner or member.',
        type: [collection_entity_1.Collection],
    }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_2.ApiOperation)({ summary: 'Get a collection by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'Return the collection.',
        type: collection_entity_1.Collection,
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_2.ApiOperation)({ summary: 'Get collection statistics' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
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
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_2.ApiOperation)({ summary: 'Update a collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'The collection has been successfully updated.',
        type: collection_entity_1.Collection,
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_collection_dto_1.UpdateCollectionDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_2.ApiOperation)({ summary: 'Delete a collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 204,
        description: 'The collection has been successfully deleted.',
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden. Only owner can delete.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, swagger_2.ApiOperation)({ summary: 'Invite a user to join the collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 201,
        description: 'User has been successfully invited.',
        type: collection_members_1.CollectionMember,
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden. Need admin permission.' }),
    (0, swagger_2.ApiResponse)({ status: 400, description: 'User already a member.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invite_member_dto_1.InviteMemberDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_2.ApiOperation)({ summary: 'Join a collection using an invite code' }),
    (0, swagger_2.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                inviteCode: { type: 'string', description: 'Invite code' },
            },
            required: ['inviteCode'],
        },
    }),
    (0, swagger_2.ApiResponse)({
        status: 201,
        description: 'Successfully joined the collection.',
        type: collection_entity_1.Collection,
    }),
    (0, swagger_2.ApiResponse)({ status: 400, description: 'Already a member.' }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Invalid invite code.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Body)('inviteCode')),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "joinByInviteCode", null);
__decorate([
    (0, common_1.Patch)(':id/members/:memberId/permissions'),
    (0, swagger_2.ApiOperation)({ summary: 'Update member permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', description: 'Member ID', type: 'string' }),
    (0, swagger_2.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                permissions: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: Object.values(collection_members_1.Permission),
                    },
                    description: 'Array of permissions',
                },
            },
            required: ['permissions'],
        },
    }),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'Member permissions have been successfully updated.',
        type: collection_members_1.CollectionMember,
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection or member not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden. Need admin permission.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('memberId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('permissions')),
    __param(3, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "updateMemberPermissions", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_2.ApiOperation)({ summary: 'Remove a member from the collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', description: 'Member ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 204,
        description: 'Member has been successfully removed.',
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection or member not found.' }),
    (0, swagger_2.ApiResponse)({
        status: 403,
        description: 'Forbidden. Need admin permission or cannot remove owner.',
    }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('memberId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_2.ApiOperation)({ summary: 'Leave the collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 204,
        description: 'Successfully left the collection.',
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found or not a member.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden. Owner cannot leave.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "leaveCollection", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-invite'),
    (0, swagger_2.ApiOperation)({ summary: 'Regenerate invite code for the collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Collection ID', type: 'string' }),
    (0, swagger_2.ApiResponse)({
        status: 201,
        description: 'Invite code has been successfully regenerated.',
        schema: {
            type: 'object',
            properties: {
                inviteCode: { type: 'string', description: 'New invite code' },
            },
        },
    }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Collection not found.' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Forbidden. Need admin permission.' }),
    (0, swagger_2.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "regenerateInviteCode", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, swagger_1.ApiTags)('collections'),
    (0, common_1.Controller)('collections'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [collection_service_1.CollectionsService])
], CollectionsController);
//# sourceMappingURL=collection.controller.js.map