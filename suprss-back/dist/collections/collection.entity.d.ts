import { User } from '../user/user.entity';
import { Feed } from '../feeds/feeds.entity';
import { CollectionMember } from './collection-members';
import { Message } from '../message/message.entity';
export declare class Collection {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    ownerId: string;
    feeds: Feed[];
    members: CollectionMember[];
    messages: Message[];
}
