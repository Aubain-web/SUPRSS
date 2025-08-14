import type {User} from "./auth.ts";
import type {RSSFeed} from "./feeds.ts";

export interface Collection {
    id: string;
    name: string;
    description?: string;
    isShared: boolean;
    createdBy: string;
    members: CollectionMember[];
    feeds: RSSFeed[];
    createdAt: string;
    updatedAt: string;
}

export interface CollectionMember {
    userId: string;
    user: User;
    role: CollectionRole;
    permissions: CollectionPermissions;
    joinedAt: string;
}

export type CollectionRole = 'owner' | 'admin' | 'member';

export interface CollectionPermissions {
    canAddFeeds: boolean;
    canRemoveFeeds: boolean;
    canInviteMembers: boolean;
    canComment: boolean;
    canModerate: boolean;
}