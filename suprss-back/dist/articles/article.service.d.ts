import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './article.entity';
import { CollectionsService } from '../collections/collection.service';
import { User } from '../user/user.entity';
export interface ArticleFilters {
    feedIds?: string[];
    categories?: string[];
    isRead?: boolean;
    isFavorite?: boolean;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export declare class ArticlesService {
    private readonly articleRepository;
    private readonly collectionsService;
    constructor(articleRepository: Repository<Article>, collectionsService: CollectionsService);
    create(createArticleDto: CreateArticleDto): Promise<Article>;
    findAll(user: User, filters?: ArticleFilters): Promise<{
        articles: Article[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string, user: User): Promise<Article>;
    update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<Article>;
    remove(id: string, user: User): Promise<void>;
    markAsRead(id: string, user: User): Promise<Article>;
    markAsUnread(id: string, user: User): Promise<Article>;
    toggleFavorite(id: string, user: User): Promise<Article>;
    markAllAsRead(feedIds: string[], user: User): Promise<void>;
    getUnreadCount(user: User): Promise<Record<string, number>>;
    getFavorites(user: User): Promise<Article[]>;
    createBulk(articles: CreateArticleDto[]): Promise<Article[]>;
    deleteOldArticles(olderThanDays?: number): Promise<void>;
}
