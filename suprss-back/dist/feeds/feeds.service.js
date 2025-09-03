"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feeds_entity_1 = require("./feeds.entity");
const rss_service_1 = require("../rss/rss.service");
const collection_service_1 = require("../collections/collection.service");
const collection_members_1 = require("../collections/collection-members");
let FeedsService = class FeedsService {
    feedRepository;
    rssService;
    collectionsService;
    constructor(feedRepository, rssService, collectionsService) {
        this.feedRepository = feedRepository;
        this.rssService = rssService;
        this.collectionsService = collectionsService;
    }
    async create(createFeedDto, user) {
        try {
            await this.rssService.validateRssFeed(createFeedDto.url);
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid RSS feed URL');
        }
        if (createFeedDto.collectionId) {
            const hasPermission = await this.collectionsService.hasPermission(createFeedDto.collectionId, user.id, collection_members_1.Permission.ADD_FEED);
            if (!hasPermission) {
                throw new common_1.ForbiddenException('You do not have permission to add feeds to this collection');
            }
        }
        const existingFeed = await this.feedRepository.findOne({
            where: { url: createFeedDto.url },
        });
        if (existingFeed) {
            throw new common_1.BadRequestException('This RSS feed URL already exists');
        }
        const feed = this.feedRepository.create({
            ...createFeedDto,
            owner: user,
            ownerId: user.id,
        });
        const savedFeed = await this.feedRepository.save(feed);
        await this.rssService.fetchFeedArticles(savedFeed);
        return this.findOne(savedFeed.id, user);
    }
    async findAll(user, collectionId) {
        const queryBuilder = this.feedRepository
            .createQueryBuilder('feed')
            .leftJoinAndSelect('feed.owner', 'owner')
            .leftJoinAndSelect('feed.collection', 'collection')
            .leftJoinAndSelect('feed.articles', 'articles')
            .where('feed.ownerId = :userId', { userId: user.id });
        if (collectionId) {
            queryBuilder.andWhere('feed.collectionId = :collectionId', { collectionId });
        }
        return queryBuilder.orderBy('feed.createdAt', 'DESC').getMany();
    }
    async findOne(id, user) {
        const feed = await this.feedRepository.findOne({
            where: { id },
            relations: ['owner', 'collection', 'articles'],
        });
        if (!feed) {
            throw new common_1.NotFoundException('Feed not found');
        }
        if (feed.ownerId !== user.id) {
            if (feed.collection) {
                const hasPermission = await this.collectionsService.hasPermission(feed.collection.id, user.id, collection_members_1.Permission.READ);
                if (!hasPermission) {
                    throw new common_1.ForbiddenException('You do not have access to this feed');
                }
            }
            else {
                throw new common_1.ForbiddenException('You do not have access to this feed');
            }
        }
        return feed;
    }
    async update(id, updateFeedDto, user) {
        const feed = await this.findOne(id, user);
        if (feed.ownerId !== user.id) {
            if (feed.collection) {
                const hasPermission = await this.collectionsService.hasPermission(feed.collection.id, user.id, collection_members_1.Permission.EDIT_FEED);
                if (!hasPermission) {
                    throw new common_1.ForbiddenException('You do not have permission to edit this feed');
                }
            }
            else {
                throw new common_1.ForbiddenException('You do not have permission to edit this feed');
            }
        }
        if (updateFeedDto.url && updateFeedDto.url !== feed.url) {
            try {
                await this.rssService.validateRssFeed(updateFeedDto.url);
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid RSS feed URL');
            }
            const existingFeed = await this.feedRepository.findOne({
                where: { url: updateFeedDto.url },
            });
            if (existingFeed && existingFeed.id !== id) {
                throw new common_1.BadRequestException('This RSS feed URL already exists');
            }
        }
        await this.feedRepository.update(id, updateFeedDto);
        return this.findOne(id, user);
    }
    async remove(id, user) {
        const feed = await this.findOne(id, user);
        if (feed.ownerId !== user.id) {
            if (feed.collection) {
                const hasPermission = await this.collectionsService.hasPermission(feed.collection.id, user.id, collection_members_1.Permission.DELETE_FEED);
                if (!hasPermission) {
                    throw new common_1.ForbiddenException('You do not have permission to delete this feed');
                }
            }
            else {
                throw new common_1.ForbiddenException('You do not have permission to delete this feed');
            }
        }
        await this.feedRepository.remove(feed);
    }
    async toggleFavorite(id, user) {
        const feed = await this.findOne(id, user);
        const favoriteIndex = feed.favoritedBy.findIndex((u) => u.id === user.id);
        if (favoriteIndex > -1) {
            feed.favoritedBy.splice(favoriteIndex, 1);
        }
        else {
            feed.favoritedBy.push(user);
        }
        await this.feedRepository.save(feed);
        return this.findOne(id, user);
    }
    async getFavorites(user) {
        return this.feedRepository
            .createQueryBuilder('feed')
            .leftJoinAndSelect('feed.favoritedBy', 'user')
            .leftJoinAndSelect('feed.owner', 'owner')
            .leftJoinAndSelect('feed.collection', 'collection')
            .where('user.id = :userId', { userId: user.id })
            .orderBy('feed.createdAt', 'DESC')
            .getMany();
    }
    async findByTags(tags, user) {
        const queryBuilder = this.feedRepository
            .createQueryBuilder('feed')
            .leftJoinAndSelect('feed.owner', 'owner')
            .leftJoinAndSelect('feed.collection', 'collection')
            .where('feed.ownerId = :userId', { userId: user.id });
        for (const tag of tags) {
            queryBuilder.andWhere(':tag = ANY(feed.tags)', { tag });
        }
        return queryBuilder.orderBy('feed.createdAt', 'DESC').getMany();
    }
    async updateLastFetch(id, error) {
        const updateData = {
            lastFetchedAt: new Date(),
        };
        if (error) {
            updateData.lastErrorAt = new Date();
            updateData.lastError = error;
        }
        else {
            updateData.lastError = null;
            updateData.lastErrorAt = null;
        }
        await this.feedRepository.update(id, updateData);
    }
    async getActiveFeeds() {
        return this.feedRepository.find({
            where: { isActive: true },
            relations: ['owner'],
        });
    }
};
exports.FeedsService = FeedsService;
exports.FeedsService = FeedsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feeds_entity_1.Feed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rss_service_1.RssService,
        collection_service_1.CollectionsService])
], FeedsService);
//# sourceMappingURL=feeds.service.js.map