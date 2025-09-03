import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { User } from '../user/user.entity';
export declare class FeedsController {
    private readonly feedsService;
    constructor(feedsService: FeedsService);
    create(createFeedDto: CreateFeedDto, user: User): Promise<import("./feeds.entity").Feed>;
    findAll(user: User, collectionId?: string): Promise<import("./feeds.entity").Feed[]>;
    getFavorites(user: User): Promise<import("./feeds.entity").Feed[]>;
    findByTags(tags: string, user: User): Promise<import("./feeds.entity").Feed[]>;
    findOne(id: string, user: User): Promise<import("./feeds.entity").Feed>;
    update(id: string, updateFeedDto: UpdateFeedDto, user: User): Promise<import("./feeds.entity").Feed>;
    remove(id: string, user: User): Promise<void>;
    toggleFavorite(id: string, user: User): Promise<import("./feeds.entity").Feed>;
}
