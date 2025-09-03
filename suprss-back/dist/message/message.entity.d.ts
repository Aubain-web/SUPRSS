import { User } from '../user/user.entity';
import { Collection } from '../collections/collection.entity';
export declare class Message {
    id: string;
    content: string;
    createdAt: Date;
    author: User;
    authorId: string;
    collection: Collection;
    collectionId: string;
}
