import { Feed } from '../feeds/feeds.entity';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';
export declare class Article {
    id: string;
    title: string;
    link: string;
    author: string | null;
    description: string | null;
    content: string | null;
    publishedAt: Date;
    imageUrl: string | null;
    categories: string[];
    createdAt: Date;
    updatedAt: Date;
    feed: Feed;
    feedId: string;
    comments: Comment[];
    readBy: User[];
    favoritedBy: User[];
}
