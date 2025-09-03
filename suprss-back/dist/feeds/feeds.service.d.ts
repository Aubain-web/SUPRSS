import { Repository } from 'typeorm';
import { Feed } from './feeds.entity';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { User } from '../user/user.entity';
import { RssService } from '../rss/rss.service';
import { CollectionsService } from '../collections/collection.service';
export declare class FeedsService {
    private readonly feedRepository;
    private readonly rssService;
    private readonly collectionsService;
    constructor(feedRepository: Repository<Feed>, rssService: RssService, collectionsService: CollectionsService);
    create(createFeedDto: CreateFeedDto, user: User): Promise<Feed>;
    findAll(user: User, collectionId?: string): Promise<Feed[]>;
    findOne(id: string, user: User): Promise<Feed>;
    update(id: string, updateFeedDto: UpdateFeedDto, user: User): Promise<Feed>;
    remove(id: string, user: User): Promise<void>;
    toggleFavorite(id: string, user: User): Promise<Feed>;
    getFavorites(user: User): Promise<Feed[]>;
    findByTags(tags: string[], user: User): Promise<Feed[]>;
    updateLastFetch(id: string, error?: string): Promise<void>;
    getActiveFeeds(): Promise<Feed[]>;
}
