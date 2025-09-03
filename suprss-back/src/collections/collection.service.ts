import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Collection } from './collection.entity';
import { CollectionMember, Permission } from './collection-members';
import { User } from '../user/user.entity';
import { CreateCollectionDto } from './create-collection.dto';
import { UpdateCollectionDto } from './update-collection.dto';
import { InviteMemberDto } from './invite-member.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionMember)
    private readonly collectionMemberRepository: Repository<CollectionMember>,
  ) {}

  async create(createCollectionDto: CreateCollectionDto, user: User): Promise<Collection> {
    const inviteCode = uuidv4().substring(0, 8);

    const collection = this.collectionRepository.create({
      ...createCollectionDto,
      owner: user,
      ownerId: user.id,
      inviteCode,
    });

    const savedCollection = await this.collectionRepository.save(collection);

    // le créateur devient membre avec tous les droits
    const ownerMember = this.collectionMemberRepository.create({
      user,
      userId: user.id,
      collection: savedCollection,
      collectionId: savedCollection.id,
      permissions: [
        Permission.READ,
        Permission.ADD_FEED,
        Permission.EDIT_FEED,
        Permission.DELETE_FEED,
        Permission.COMMENT,
        Permission.ADMIN,
      ],
      isActive: true,
    });
    await this.collectionMemberRepository.save(ownerMember);

    return this.findOne(savedCollection.id, user);
  }

  async findAll(user: User): Promise<Collection[]> {
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

  async findOne(id: string, user: User): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'feeds', 'feeds.articles'],
    });

    if (!collection) throw new NotFoundException('Collection not found');

    // accès : propriétaire ou membre actif
    if (collection.ownerId !== user.id) {
      const member = collection.members.find((m) => m.userId === user.id && m.isActive);
      if (!member) throw new ForbiddenException('You do not have access to this collection');
    }
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto, user: User): Promise<Collection> {
    const collection = await this.findOne(id, user);

    if (collection.ownerId !== user.id) {
      const ok = await this.hasPermission(id, user.id, Permission.ADMIN);
      if (!ok) throw new ForbiddenException('You do not have permission to update this collection');
    }

    await this.collectionRepository.update(id, dto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const collection = await this.findOne(id, user);
    if (collection.ownerId !== user.id) {
      throw new ForbiddenException('Only the collection owner can delete it');
    }
    await this.collectionRepository.remove(collection);
  }

  async inviteMember(
    id: string,
    inviteMemberDto: InviteMemberDto,
    user: User,
  ): Promise<CollectionMember> {
    const collection = await this.findOne(id, user);

    if (collection.ownerId !== user.id) {
      const ok = await this.hasPermission(id, user.id, Permission.ADMIN);
      if (!ok) throw new ForbiddenException('You do not have permission to invite members');
    }

    const existing = await this.collectionMemberRepository.findOne({
      where: { collectionId: id, userId: inviteMemberDto.userId },
    });

    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException('User is already a member of this collection');
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

  async joinByInviteCode(inviteCode: string, user: User): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { inviteCode },
      relations: ['members'],
    });
    if (!collection) throw new NotFoundException('Invalid invite code');

    const existing = collection.members.find((m) => m.userId === user.id);
    if (existing && existing.isActive) {
      throw new BadRequestException('You are already a member of this collection');
    }
    if (existing && !existing.isActive) {
      existing.isActive = true;
      await this.collectionMemberRepository.save(existing);
    } else {
      const member = this.collectionMemberRepository.create({
        collectionId: collection.id,
        userId: user.id,
        permissions: [Permission.READ, Permission.COMMENT],
        isActive: true,
      });
      await this.collectionMemberRepository.save(member);
    }
    return this.findOne(collection.id, user);
  }

  async updateMemberPermissions(
    collectionId: string,
    memberId: string,
    permissions: Permission[],
    user: User,
  ): Promise<CollectionMember> {
    const collection = await this.findOne(collectionId, user);

    if (collection.ownerId !== user.id) {
      const ok = await this.hasPermission(collectionId, user.id, Permission.ADMIN);
      if (!ok)
        throw new ForbiddenException('You do not have permission to modify member permissions');
    }

    const member = await this.collectionMemberRepository.findOne({
      where: { id: memberId, collectionId },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (member.userId === collection.ownerId) {
      throw new ForbiddenException('Cannot modify owner permissions');
    }

    member.permissions = permissions;
    return this.collectionMemberRepository.save(member);
  }

  async removeMember(collectionId: string, memberId: string, user: User): Promise<void> {
    const collection = await this.findOne(collectionId, user);

    if (collection.ownerId !== user.id) {
      const ok = await this.hasPermission(collectionId, user.id, Permission.ADMIN);
      if (!ok) throw new ForbiddenException('You do not have permission to remove members');
    }

    const member = await this.collectionMemberRepository.findOne({
      where: { id: memberId, collectionId },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (member.userId === collection.ownerId) {
      throw new ForbiddenException('Cannot remove collection owner');
    }

    await this.collectionMemberRepository.remove(member);
  }

  async leaveCollection(collectionId: string, user: User): Promise<void> {
    const collection = await this.findOne(collectionId, user);

    if (collection.ownerId === user.id) {
      throw new ForbiddenException('Collection owner cannot leave their own collection');
    }

    const member = await this.collectionMemberRepository.findOne({
      where: { collectionId, userId: user.id },
    });
    if (!member) throw new NotFoundException('You are not a member of this collection');

    await this.collectionMemberRepository.remove(member);
  }

  async hasPermission(
    collectionId: string,
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    const member = await this.collectionMemberRepository.findOne({
      where: { collectionId, userId, isActive: true },
    });
    if (!member) return false;
    return member.permissions.includes(permission) || member.permissions.includes(Permission.ADMIN);
  }

  async regenerateInviteCode(collectionId: string, user: User): Promise<string> {
    const collection = await this.findOne(collectionId, user);

    if (collection.ownerId !== user.id) {
      const ok = await this.hasPermission(collectionId, user.id, Permission.ADMIN);
      if (!ok) throw new ForbiddenException('You do not have permission to regenerate invite code');
    }

    const newInviteCode = uuidv4().substring(0, 8);
    await this.collectionRepository.update(collectionId, { inviteCode: newInviteCode });
    return newInviteCode;
  }

  async getCollectionStats(
    collectionId: string,
    user: User,
  ): Promise<{
    totalFeeds: number;
    totalArticles: number;
    unreadArticles: number;
    totalMembers: number;
  }> {
    const collection = await this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.feeds', 'feeds')
      .leftJoinAndSelect('feeds.articles', 'articles')
      .leftJoinAndSelect('collection.members', 'members', 'members.isActive = true')
      .leftJoinAndSelect('articles.readBy', 'readBy')
      .where('collection.id = :collectionId', { collectionId })
      .getOne();

    if (!collection) throw new NotFoundException('Collection not found');

    const totalFeeds = collection.feeds.length;
    const totalArticles = collection.feeds.reduce((sum, feed) => sum + feed.articles.length, 0);
    const unreadArticles = collection.feeds.reduce(
      (sum, feed) =>
        sum +
        feed.articles.filter(
          (article) => !(article.readBy ?? []).some((reader) => reader.id === user.id),
        ).length,
      0,
    );
    const totalMembers = collection.members.length;

    return { totalFeeds, totalArticles, unreadArticles, totalMembers };
  }
}
