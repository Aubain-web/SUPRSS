import { Collection } from './collection.entity';
import { User } from '../user/user.entity';
export declare enum Permission {
    READ = "read",
    ADD_FEED = "add_feed",
    EDIT_FEED = "edit_feed",
    DELETE_FEED = "delete_feed",
    COMMENT = "comment",
    ADMIN = "admin"
}
export declare class CollectionMember {
    id: string;
    permissions: Permission[];
    isActive: boolean;
    joinedAt: Date;
    user: User;
    userId: string;
    collection: Collection;
    collectionId: string;
}
