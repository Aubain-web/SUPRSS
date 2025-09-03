import { Article } from '../articles/article.entity';
import { User } from '../user/user.entity';
export declare class Comment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    article: Article;
    articleId: string;
    author: User;
    authorId: string;
}
