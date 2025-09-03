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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("./article.entity");
const collection_service_1 = require("../collections/collection.service");
const collection_members_1 = require("../collections/collection-members");
let ArticlesService = class ArticlesService {
    articleRepository;
    collectionsService;
    constructor(articleRepository, collectionsService) {
        this.articleRepository = articleRepository;
        this.collectionsService = collectionsService;
    }
    async create(createArticleDto) {
        const existingArticle = await this.articleRepository.findOne({
            where: { link: createArticleDto.link },
        });
        if (existingArticle)
            return existingArticle;
        const article = this.articleRepository.create(createArticleDto);
        return this.articleRepository.save(article);
    }
    async findAll(user, filters = {}) {
        const { feedIds, categories, isRead, isFavorite, search, startDate, endDate, page = 1, limit = 20, } = filters;
        const qb = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.feed', 'feed')
            .leftJoinAndSelect('feed.owner', 'feedOwner')
            .leftJoinAndSelect('feed.collection', 'collection')
            .leftJoinAndSelect('article.readBy', 'readByUser', 'readByUser.id = :userId', {
            userId: user.id,
        })
            .leftJoinAndSelect('article.favoritedBy', 'favoritedByUser', 'favoritedByUser.id = :userId', {
            userId: user.id,
        })
            .where('(feed.ownerId = :userId OR collection.id IN (SELECT cm.collectionId FROM collection_members cm WHERE cm.userId = :userId AND cm.isActive = true))', { userId: user.id });
        if (feedIds?.length)
            qb.andWhere('feed.id IN (:...feedIds)', { feedIds });
        if (categories?.length) {
            for (const cat of categories) {
                qb.andWhere('article.categories LIKE :cat', { cat: `%${cat}%` });
            }
        }
        if (typeof isRead === 'boolean') {
            qb.andWhere(isRead ? 'readByUser.id IS NOT NULL' : 'readByUser.id IS NULL');
        }
        if (typeof isFavorite === 'boolean') {
            qb.andWhere(isFavorite ? 'favoritedByUser.id IS NOT NULL' : 'favoritedByUser.id IS NULL');
        }
        if (search) {
            qb.andWhere('(article.title ILIKE :search OR article.description ILIKE :search OR article.content ILIKE :search)', { search: `%${search}%` });
        }
        if (startDate)
            qb.andWhere('article.publishedAt >= :startDate', { startDate });
        if (endDate)
            qb.andWhere('article.publishedAt <= :endDate', { endDate });
        const total = await qb.getCount();
        const totalPages = Math.ceil(total / limit);
        const articles = await qb
            .orderBy('article.publishedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { articles, total, page, totalPages };
    }
    async findOne(id, user) {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: [
                'feed',
                'feed.owner',
                'feed.collection',
                'comments',
                'comments.author',
                'readBy',
                'favoritedBy',
            ],
        });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        if (article.feed.ownerId !== user.id) {
            if (article.feed.collection) {
                const canRead = await this.collectionsService.hasPermission(article.feed.collection.id, user.id, collection_members_1.Permission.READ);
                if (!canRead) {
                    throw new common_1.ForbiddenException('You do not have access to this article');
                }
            }
            else {
                throw new common_1.ForbiddenException('You do not have access to this article');
            }
        }
        return article;
    }
    async update(id, updateArticleDto, user) {
        await this.findOne(id, user);
        await this.articleRepository.update(id, updateArticleDto);
        return this.findOne(id, user);
    }
    async remove(id, user) {
        const article = await this.findOne(id, user);
        await this.articleRepository.remove(article);
    }
    async markAsRead(id, user) {
        const article = await this.findOne(id, user);
        const already = (article.readBy ?? []).some((u) => u.id === user.id);
        if (!already) {
            article.readBy = [...(article.readBy ?? []), user];
            await this.articleRepository.save(article);
        }
        return this.findOne(id, user);
    }
    async markAsUnread(id, user) {
        const article = await this.findOne(id, user);
        const next = (article.readBy ?? []).filter((u) => u.id !== user.id);
        if (next.length !== (article.readBy?.length ?? 0)) {
            article.readBy = next;
            await this.articleRepository.save(article);
        }
        return this.findOne(id, user);
    }
    async toggleFavorite(id, user) {
        const article = await this.findOne(id, user);
        const exists = (article.favoritedBy ?? []).some((u) => u.id === user.id);
        article.favoritedBy = exists
            ? (article.favoritedBy ?? []).filter((u) => u.id !== user.id)
            : [...(article.favoritedBy ?? []), user];
        await this.articleRepository.save(article);
        return this.findOne(id, user);
    }
    async markAllAsRead(feedIds, user) {
        const articles = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoin('article.readBy', 'readBy', 'readBy.id = :userId', { userId: user.id })
            .where('article.feedId IN (:...feedIds)', { feedIds })
            .andWhere('readBy.id IS NULL')
            .getMany();
        for (const article of articles) {
            await this.articleRepository
                .createQueryBuilder()
                .relation(article_entity_1.Article, 'readBy')
                .of(article.id)
                .add(user.id);
        }
    }
    async getUnreadCount(user) {
        const rows = await this.articleRepository
            .createQueryBuilder('article')
            .select('article.feedId', 'feedId')
            .addSelect('COUNT(*)', 'count')
            .leftJoin('article.feed', 'feed')
            .leftJoin('feed.collection', 'collection')
            .leftJoin('article.readBy', 'readBy', 'readBy.id = :userId', { userId: user.id })
            .where('(feed.ownerId = :userId OR collection.id IN (SELECT cm.collectionId FROM collection_members cm WHERE cm.userId = :userId AND cm.isActive = true))', { userId: user.id })
            .andWhere('readBy.id IS NULL')
            .groupBy('article.feedId')
            .getRawMany();
        return rows.reduce((acc, row) => {
            acc[row.feedId] = parseInt(row.count, 10);
            return acc;
        }, {});
    }
    async getFavorites(user) {
        return this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.feed', 'feed')
            .leftJoinAndSelect('article.favoritedBy', 'favUser')
            .where('favUser.id = :userId', { userId: user.id })
            .orderBy('article.publishedAt', 'DESC')
            .getMany();
    }
    async createBulk(articles) {
        const existing = await this.articleRepository.find({
            where: { link: (0, typeorm_2.In)(articles.map((a) => a.link)) },
        });
        const existingLinks = new Set(existing.map((a) => a.link));
        const newOnes = articles.filter((a) => !existingLinks.has(a.link));
        if (newOnes.length === 0)
            return existing;
        const created = await this.articleRepository.save(this.articleRepository.create(newOnes));
        return [...existing, ...created];
    }
    async deleteOldArticles(olderThanDays = 90) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - olderThanDays);
        await this.articleRepository
            .createQueryBuilder()
            .delete()
            .where('publishedAt < :cutoffDate', { cutoffDate: cutoff })
            .execute();
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        collection_service_1.CollectionsService])
], ArticlesService);
//# sourceMappingURL=article.service.js.map