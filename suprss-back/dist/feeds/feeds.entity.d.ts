import { User } from '../user/user.entity';
import { Collection } from '../collections/collection.entity';
import { Article } from '../articles/article.entity';
export declare class Feed {
    id: string;
    title: string;
    url: string;
    description: string;
    tags: string[];
    updateFrequency: number;
    isActive: boolean;
    lastFetchedAt: Date;
    lastErrorAt: Date;
    lastError: string;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    ownerId: string;
    collection: Collection;
    collectionId: string;
    articles: Article[];
    favoritedBy: User[];
}
