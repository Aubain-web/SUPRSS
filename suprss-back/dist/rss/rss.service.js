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
var RssService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feeds_entity_1 = require("../feeds/feeds.entity");
const rss_paper_service_1 = require("./rss-paper.service");
const article_service_1 = require("../articles/article.service");
function toStringOrUndefined(v) {
    return typeof v === 'string' ? v : undefined;
}
function toISODateStringOrNow(v) {
    if (typeof v === 'string') {
        const d = new Date(v);
        if (!isNaN(d.getTime()))
            return d.toISOString();
    }
    return new Date().toISOString();
}
function toStringArray(v) {
    if (Array.isArray(v)) {
        const arr = v.filter((x) => typeof x === 'string');
        return arr.length ? arr : undefined;
    }
    return undefined;
}
function getErrorMessage(err) {
    return err instanceof Error ? err.message : String(err);
}
let RssService = RssService_1 = class RssService {
    feedRepository;
    rssParserService;
    articlesService;
    logger = new common_1.Logger(RssService_1.name);
    constructor(feedRepository, rssParserService, articlesService) {
        this.feedRepository = feedRepository;
        this.rssParserService = rssParserService;
        this.articlesService = articlesService;
    }
    async validateRssFeed(url) {
        try {
            const feed = await this.rssParserService.parseFeed(url);
            return Boolean(feed?.title);
        }
        catch (error) {
            this.logger.error(`Failed to validate RSS feed ${url}: ${getErrorMessage(error)}`);
            throw error;
        }
    }
    async fetchFeedArticles(feed) {
        try {
            this.logger.log(`Fetching articles for feed: ${feed.title} (${feed.url})`);
            const parsedFeed = (await this.rssParserService.parseFeed(feed.url));
            if (!parsedFeed.items || parsedFeed.items.length === 0) {
                this.logger.warn(`No articles found for feed: ${feed.title}`);
                await this.updateFeedStatus(feed.id, null);
                return;
            }
            const articles = parsedFeed.items.map((item) => {
                const title = toStringOrUndefined(item.title) ?? 'Untitled';
                const link = toStringOrUndefined(item.link) ?? '';
                const author = toStringOrUndefined(item.creator) ?? toStringOrUndefined(item.author) ?? undefined;
                const description = toStringOrUndefined(item.contentSnippet) ??
                    toStringOrUndefined(item.summary) ??
                    undefined;
                const content = toStringOrUndefined(item.content) ?? toStringOrUndefined(item.description) ?? undefined;
                const publishedAt = toISODateStringOrNow(item.pubDate);
                const imageUrl = this.extractImageUrl(item);
                const categories = toStringArray(item.categories);
                return {
                    title,
                    link,
                    author,
                    description,
                    content,
                    publishedAt,
                    imageUrl,
                    categories,
                    feedId: feed.id,
                };
            });
            const valid = articles.filter((a) => a.link);
            if (valid.length > 0) {
                await this.articlesService.createBulk(valid);
                this.logger.log(`Successfully processed ${valid.length} articles for feed: ${feed.title}`);
            }
            await this.updateFeedStatus(feed.id, null);
        }
        catch (error) {
            this.logger.error(`Failed to fetch articles for feed ${feed.title} (${feed.url}): ${getErrorMessage(error)}`);
            await this.updateFeedStatus(feed.id, getErrorMessage(error));
        }
    }
    extractImageUrl(item) {
        const enclosure = item.enclosure;
        if (enclosure &&
            typeof enclosure.url === 'string' &&
            typeof enclosure.type === 'string' &&
            enclosure.type.includes('image')) {
            return enclosure.url;
        }
        const image = item.image;
        if (image && typeof image.url === 'string')
            return image.url;
        const thumb = item['media:thumbnail'];
        if (thumb && typeof thumb.url === 'string')
            return thumb.url;
        const media = item['media:content'];
        if (media &&
            typeof media.url === 'string' &&
            typeof media.type === 'string' &&
            media.type.includes('image')) {
            return media.url;
        }
        const content = toStringOrUndefined(item.content);
        if (content) {
            const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch)
                return imgMatch[1];
        }
        return undefined;
    }
    async updateFeedStatus(feedId, error) {
        const now = new Date();
        if (error) {
            await this.feedRepository
                .createQueryBuilder()
                .update(feeds_entity_1.Feed)
                .set({
                lastFetchedAt: now,
                lastErrorAt: now,
                lastError: error,
            })
                .where('id = :id', { id: feedId })
                .execute();
        }
        else {
            await this.feedRepository
                .createQueryBuilder()
                .update(feeds_entity_1.Feed)
                .set({
                lastFetchedAt: now,
                lastErrorAt: () => 'NULL',
                lastError: () => 'NULL',
            })
                .where('id = :id', { id: feedId })
                .execute();
        }
    }
    shouldUpdateFeed(feed) {
        if (!feed.lastFetchedAt)
            return true;
        const now = Date.now();
        const last = new Date(feed.lastFetchedAt).getTime();
        const delta = now - last;
        const interval = (feed.updateFrequency ?? 3600) * 1000;
        return delta >= interval;
    }
    async forceUpdateFeed(feedId) {
        const feed = await this.feedRepository.findOne({ where: { id: feedId }, relations: ['owner'] });
        if (!feed)
            throw new Error('Feed not found');
        await this.fetchFeedArticles(feed);
    }
    async cleanupOldArticles() {
        this.logger.log('Starting cleanup of old articles');
        try {
            await this.articlesService.deleteOldArticles(90);
            this.logger.log('Completed cleanup of old articles');
        }
        catch (error) {
            this.logger.error(`Error during articles cleanup: ${getErrorMessage(error)}`);
        }
    }
};
exports.RssService = RssService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RssService.prototype, "cleanupOldArticles", null);
exports.RssService = RssService = RssService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feeds_entity_1.Feed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rss_paper_service_1.RssParserService,
        article_service_1.ArticlesService])
], RssService);
//# sourceMappingURL=rss.service.js.map