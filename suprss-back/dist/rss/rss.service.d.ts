import { Repository } from 'typeorm';
import { Feed } from '../feeds/feeds.entity';
import { RssParserService } from './rss-paper.service';
import { ArticlesService } from '../articles/article.service';
export declare class RssService {
    private readonly feedRepository;
    private readonly rssParserService;
    private readonly articlesService;
    private readonly logger;
    constructor(feedRepository: Repository<Feed>, rssParserService: RssParserService, articlesService: ArticlesService);
    validateRssFeed(url: string): Promise<boolean>;
    fetchFeedArticles(feed: Feed): Promise<void>;
    private extractImageUrl;
    private updateFeedStatus;
    private shouldUpdateFeed;
    forceUpdateFeed(feedId: string): Promise<void>;
    cleanupOldArticles(): Promise<void>;
}
