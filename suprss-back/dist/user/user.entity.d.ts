import { Feed } from '../feeds/feeds.entity';
import { CollectionMember } from '../collections/collection-members';
import { Message } from '../message/message.entity';
import { Collection } from '../collections/collection.entity';
import { Comment } from '../comment/comment.entity';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string | null;
    googleId: string | null;
    githubId: string | null;
    microsoftId: string | null;
    avatar: string | null;
    darkMode: boolean;
    fontSize: string;
    language: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    feeds: Feed[];
    ownedCollections: Collection[];
    collectionMemberships: CollectionMember[];
    comments: Comment[];
    messages: Message[];
    favoriteFeeds: Feed[];
}
