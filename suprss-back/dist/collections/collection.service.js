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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const collection_entity_1 = require("./collection.entity");
const collection_members_1 = require("./collection-members");
let CollectionsService = class CollectionsService {
    collectionRepository;
    collectionMemberRepository;
    constructor(collectionRepository, collectionMemberRepository) {
        this.collectionRepository = collectionRepository;
        this.collectionMemberRepository = collectionMemberRepository;
    }
    async create(createCollectionDto, user) {
        const inviteCode = (0, uuid_1.v4)().substring(0, 8);
        const collection = this.collectionRepository.create({
            ...createCollectionDto,
            owner: user,
            ownerId: user.id,
            inviteCode,
        });
        const savedCollection = await this.collectionRepository.save(collection);
        const ownerMember = this.collectionMemberRepository.create({
            user,
            userId: user.id,
            collection: savedCollection,
            collectionId: savedCollection.id,
            permissions: [
                collection_members_1.Permission.READ,
                collection_members_1.Permission.ADD_FEED,
                collection_members_1.Permission.EDIT_FEED,
                collection_members_1.Permission.DELETE_FEED,
                collection_members_1.Permission.COMMENT,
                collection_members_1.Permission.ADMIN,
            ],
            isActive: true,
        });
        await this.collectionMemberRepository.save(ownerMember);
        return this.findOne(savedCollection.id, user);
    }
    async findAll(user) {
        return this.collectionRepository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.owner', 'owner')
            .leftJoinAndSelect('collection.members', 'members', 'members.isActive = true')
            .leftJoinAndSelect('members.user', 'memberUser')
            .leftJoinAndSelect('collection.feeds', 'feeds')
            .where('collection.ownerId = :userId', { userId: user.id })
            .orWhere('members.userId = :userId', { userId: user.id })
            .orderBy('collection.createdAt', 'DESC')
            .getMany();
    }
    async findOne(id, user) {
        const collection = await this.collectionRepository.findOne({
            where: { id },
            relations: ['owner', 'members', 'members.user', 'feeds', 'feeds.articles'],
        });
        if (!collection)
            throw new common_1.NotFoundException('Collection not found');
        if (collection.ownerId !== user.id) {
            const member = collection.members.find((m) => m.userId === user.id && m.isActive);
            if (!member)
                throw new common_1.ForbiddenException('You do not have access to this collection');
        }
        return collection;
    }
    async update(id, dto, user) {
        const collection = await this.findOne(id, user);
        if (collection.ownerId !== user.id) {
            const ok = await this.hasPermission(id, user.id, collection_members_1.Permission.ADMIN);
            if (!ok)
                throw new common_1.ForbiddenException('You do not have permission to update this collection');
        }
        await this.collectionRepository.update(id, dto);
        return this.findOne(id, user);
    }
    async remove(id, user) {
        const collection = await this.findOne(id, user);
        if (collection.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Only the collection owner can delete it');
        }
        await this.collectionRepository.remove(collection);
    }
    async inviteMember(id, inviteMemberDto, user) {
        const collection = await this.findOne(id, user);
        if (collection.ownerId !== user.id) {
            const ok = await this.hasPermission(id, user.id, collection_members_1.Permission.ADMIN);
            if (!ok)
                throw new common_1.ForbiddenException('You do not have permission to invite members');
        }
        const existing = await this.collectionMemberRepository.findOne({
            where: { collectionId: id, userId: inviteMemberDto.userId },
        });
        if (existing) {
            if (existing.isActive) {
                throw new common_1.BadRequestException('User is already a member of this collection');
            }
            existing.isActive = true;
            existing.permissions = inviteMemberDto.permissions;
            return this.collectionMemberRepository.save(existing);
        }
        const member = this.collectionMemberRepository.create({
            collectionId: id,
            userId: inviteMemberDto.userId,
            permissions: inviteMemberDto.permissions,
            isActive: true,
        });
        return this.collectionMemberRepository.save(member);
    }
    async joinByInviteCode(inviteCode, user) {
        const collection = await this.collectionRepository.findOne({
            where: { inviteCode },
            relations: ['members'],
        });
        if (!collection)
            throw new common_1.NotFoundException('Invalid invite code');
        const existing = collection.members.find((m) => m.userId === user.id);
        if (existing && existing.isActive) {
            throw new common_1.BadRequestException('You are already a member of this collection');
        }
        if (existing && !existing.isActive) {
            existing.isActive = true;
            await this.collectionMemberRepository.save(existing);
        }
        else {
            const member = this.collectionMemberRepository.create({
                collectionId: collection.id,
                userId: user.id,
                permissions: [collection_members_1.Permission.READ, collection_members_1.Permission.COMMENT],
                isActive: true,
            });
            await this.collectionMemberRepository.save(member);
        }
        return this.findOne(collection.id, user);
    }
    async updateMemberPermissions(collectionId, memberId, permissions, user) {
        const collection = await this.findOne(collectionId, user);
        if (collection.ownerId !== user.id) {
            const ok = await this.hasPermission(collectionId, user.id, collection_members_1.Permission.ADMIN);
            if (!ok)
                throw new common_1.ForbiddenException('You do not have permission to modify member permissions');
        }
        const member = await this.collectionMemberRepository.findOne({
            where: { id: memberId, collectionId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (member.userId === collection.ownerId) {
            throw new common_1.ForbiddenException('Cannot modify owner permissions');
        }
        member.permissions = permissions;
        return this.collectionMemberRepository.save(member);
    }
    async removeMember(collectionId, memberId, user) {
        const collection = await this.findOne(collectionId, user);
        if (collection.ownerId !== user.id) {
            const ok = await this.hasPermission(collectionId, user.id, collection_members_1.Permission.ADMIN);
            if (!ok)
                throw new common_1.ForbiddenException('You do not have permission to remove members');
        }
        const member = await this.collectionMemberRepository.findOne({
            where: { id: memberId, collectionId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (member.userId === collection.ownerId) {
            throw new common_1.ForbiddenException('Cannot remove collection owner');
        }
        await this.collectionMemberRepository.remove(member);
    }
    async leaveCollection(collectionId, user) {
        const collection = await this.findOne(collectionId, user);
        if (collection.ownerId === user.id) {
            throw new common_1.ForbiddenException('Collection owner cannot leave their own collection');
        }
        const member = await this.collectionMemberRepository.findOne({
            where: { collectionId, userId: user.id },
        });
        if (!member)
            throw new common_1.NotFoundException('You are not a member of this collection');
        await this.collectionMemberRepository.remove(member);
    }
    async hasPermission(collectionId, userId, permission) {
        const member = await this.collectionMemberRepository.findOne({
            where: { collectionId, userId, isActive: true },
        });
        if (!member)
            return false;
        return member.permissions.includes(permission) || member.permissions.includes(collection_members_1.Permission.ADMIN);
    }
    async regenerateInviteCode(collectionId, user) {
        const collection = await this.findOne(collectionId, user);
        if (collection.ownerId !== user.id) {
            const ok = await this.hasPermission(collectionId, user.id, collection_members_1.Permission.ADMIN);
            if (!ok)
                throw new common_1.ForbiddenException('You do not have permission to regenerate invite code');
        }
        const newInviteCode = (0, uuid_1.v4)().substring(0, 8);
        await this.collectionRepository.update(collectionId, { inviteCode: newInviteCode });
        return newInviteCode;
    }
    async getCollectionStats(collectionId, user) {
        const collection = await this.collectionRepository
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.feeds', 'feeds')
            .leftJoinAndSelect('feeds.articles', 'articles')
            .leftJoinAndSelect('collection.members', 'members', 'members.isActive = true')
            .leftJoinAndSelect('articles.readBy', 'readBy')
            .where('collection.id = :collectionId', { collectionId })
            .getOne();
        if (!collection)
            throw new common_1.NotFoundException('Collection not found');
        const totalFeeds = collection.feeds.length;
        const totalArticles = collection.feeds.reduce((sum, feed) => sum + feed.articles.length, 0);
        const unreadArticles = collection.feeds.reduce((sum, feed) => sum +
            feed.articles.filter((article) => !(article.readBy ?? []).some((reader) => reader.id === user.id)).length, 0);
        const totalMembers = collection.members.length;
        return { totalFeeds, totalArticles, unreadArticles, totalMembers };
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(collection_entity_1.Collection)),
    __param(1, (0, typeorm_1.InjectRepository)(collection_members_1.CollectionMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CollectionsService);
//# sourceMappingURL=collection.service.js.map