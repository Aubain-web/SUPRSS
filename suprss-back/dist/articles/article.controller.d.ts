import { ArticlesService } from './article.service';
import { User } from '../user/user.entity';
import { UpdateArticleDto } from './dto/update-article.dto';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findAll(user: User, feedIds?: string, categories?: string, isRead?: string, isFavorite?: string, search?: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
        articles: import("./article.entity").Article[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUnreadCount(user: User): Promise<Record<string, number>>;
    getFavorites(user: User): Promise<import("./article.entity").Article[]>;
    findOne(id: string, user: User): Promise<import("./article.entity").Article>;
    update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<import("./article.entity").Article>;
    remove(id: string, user: User): Promise<void>;
    markAsRead(id: string, user: User): Promise<import("./article.entity").Article>;
    markAsUnread(id: string, user: User): Promise<import("./article.entity").Article>;
    toggleFavorite(id: string, user: User): Promise<import("./article.entity").Article>;
    markAllAsRead(feedIds: string[], user: User): Promise<void>;
}
