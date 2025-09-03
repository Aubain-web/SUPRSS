import { Repository } from 'typeorm';
import { Collection } from './collection.entity';
import { CollectionMember, Permission } from './collection-members';
import { User } from '../user/user.entity';
import { CreateCollectionDto } from './create-collection.dto';
import { UpdateCollectionDto } from './update-collection.dto';
import { InviteMemberDto } from './invite-member.dto';
export declare class CollectionsService {
    private readonly collectionRepository;
    private readonly collectionMemberRepository;
    constructor(collectionRepository: Repository<Collection>, collectionMemberRepository: Repository<CollectionMember>);
    create(createCollectionDto: CreateCollectionDto, user: User): Promise<Collection>;
    findAll(user: User): Promise<Collection[]>;
    findOne(id: string, user: User): Promise<Collection>;
    update(id: string, dto: UpdateCollectionDto, user: User): Promise<Collection>;
    remove(id: string, user: User): Promise<void>;
    inviteMember(id: string, inviteMemberDto: InviteMemberDto, user: User): Promise<CollectionMember>;
    joinByInviteCode(inviteCode: string, user: User): Promise<Collection>;
    updateMemberPermissions(collectionId: string, memberId: string, permissions: Permission[], user: User): Promise<CollectionMember>;
    removeMember(collectionId: string, memberId: string, user: User): Promise<void>;
    leaveCollection(collectionId: string, user: User): Promise<void>;
    hasPermission(collectionId: string, userId: string, permission: Permission): Promise<boolean>;
    regenerateInviteCode(collectionId: string, user: User): Promise<string>;
    getCollectionStats(collectionId: string, user: User): Promise<{
        totalFeeds: number;
        totalArticles: number;
        unreadArticles: number;
        totalMembers: number;
    }>;
}
