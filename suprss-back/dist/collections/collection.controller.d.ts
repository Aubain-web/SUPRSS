import { CollectionMember, Permission } from './collection-members';
import { InviteMemberDto } from './invite-member.dto';
import { UpdateCollectionDto } from './update-collection.dto';
import { Collection } from './collection.entity';
import { CollectionsService } from './collection.service';
import { CreateCollectionDto } from './create-collection.dto';
import { User } from '../user/user.entity';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    create(createCollectionDto: CreateCollectionDto, user: User): Promise<Collection>;
    findAll(user: User): Promise<Collection[]>;
    findOne(id: string, user: User): Promise<Collection>;
    getStats(id: string, user: User): Promise<{
        totalFeeds: number;
        totalArticles: number;
        unreadArticles: number;
        totalMembers: number;
    }>;
    update(id: string, updateCollectionDto: UpdateCollectionDto, user: User): Promise<Collection>;
    remove(id: string, user: User): Promise<void>;
    inviteMember(id: string, inviteMemberDto: InviteMemberDto, user: User): Promise<CollectionMember>;
    joinByInviteCode(inviteCode: string, user: User): Promise<Collection>;
    updateMemberPermissions(id: string, memberId: string, permissions: Permission[], user: User): Promise<CollectionMember>;
    removeMember(id: string, memberId: string, user: User): Promise<void>;
    leaveCollection(id: string, user: User): Promise<void>;
    regenerateInviteCode(id: string, user: User): Promise<{
        inviteCode: string;
    }>;
}
