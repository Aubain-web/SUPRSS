import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './article.entity';
import { CollectionsService } from '../collections/collection.service';
import { User } from '../user/user.entity';
import { Permission } from '../collections/collection-members';

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

type UnreadCountRow = { feedId: string; count: string };

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly collectionsService: CollectionsService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const existingArticle = await this.articleRepository.findOne({
      where: { link: createArticleDto.link },
    });
    if (existingArticle) return existingArticle;

    const article = this.articleRepository.create(createArticleDto);
    return this.articleRepository.save(article);
  }

  async findAll(
    user: User,
    filters: ArticleFilters = {},
  ): Promise<{ articles: Article[]; total: number; page: number; totalPages: number }> {
    const {
      feedIds,
      categories,
      isRead,
      isFavorite,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

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
      .where(
        '(feed.ownerId = :userId OR collection.id IN (SELECT cm.collectionId FROM collection_members cm WHERE cm.userId = :userId AND cm.isActive = true))',
        { userId: user.id },
      );

    if (feedIds?.length) qb.andWhere('feed.id IN (:...feedIds)', { feedIds });

    // NOTE : si `categories` est stocké en `simple-array`, l’opérateur `&&` (overlap) ne marche que sur un vrai tableau Postgres.
    if (categories?.length) {
      // Variante simple-array : LIKE sur la chaîne sérialisée (pragmatique)
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
      qb.andWhere(
        '(article.title ILIKE :search OR article.description ILIKE :search OR article.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) qb.andWhere('article.publishedAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('article.publishedAt <= :endDate', { endDate });

    const total = await qb.getCount();
    const totalPages = Math.ceil(total / limit);

    const articles = await qb
      .orderBy('article.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { articles, total, page, totalPages };
  }

  async findOne(id: string, user: User): Promise<Article> {
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

    if (!article) throw new NotFoundException('Article not found');

    if (article.feed.ownerId !== user.id) {
      if (article.feed.collection) {
        const canRead = await this.collectionsService.hasPermission(
          article.feed.collection.id,
          user.id,
          Permission.READ,
        );
        if (!canRead) {
          throw new ForbiddenException('You do not have access to this article');
        }
      } else {
        throw new ForbiddenException('You do not have access to this article');
      }
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<Article> {
    await this.findOne(id, user);
    await this.articleRepository.update(id, updateArticleDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const article = await this.findOne(id, user);
    await this.articleRepository.remove(article);
  }

  async markAsRead(id: string, user: User): Promise<Article> {
    const article = await this.findOne(id, user);
    const already = (article.readBy ?? []).some((u) => u.id === user.id);
    if (!already) {
      article.readBy = [...(article.readBy ?? []), user];
      await this.articleRepository.save(article);
    }
    return this.findOne(id, user);
  }

  async markAsUnread(id: string, user: User): Promise<Article> {
    const article = await this.findOne(id, user);
    const next = (article.readBy ?? []).filter((u) => u.id !== user.id);
    if (next.length !== (article.readBy?.length ?? 0)) {
      article.readBy = next;
      await this.articleRepository.save(article);
    }
    return this.findOne(id, user);
  }

  async toggleFavorite(id: string, user: User): Promise<Article> {
    const article = await this.findOne(id, user);
    const exists = (article.favoritedBy ?? []).some((u) => u.id === user.id);
    article.favoritedBy = exists
      ? (article.favoritedBy ?? []).filter((u) => u.id !== user.id)
      : [...(article.favoritedBy ?? []), user];

    await this.articleRepository.save(article);
    return this.findOne(id, user);
  }

  async markAllAsRead(feedIds: string[], user: User): Promise<void> {
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.readBy', 'readBy', 'readBy.id = :userId', { userId: user.id })
      .where('article.feedId IN (:...feedIds)', { feedIds })
      .andWhere('readBy.id IS NULL')
      .getMany();

    for (const article of articles) {
      await this.articleRepository
        .createQueryBuilder()
        .relation(Article, 'readBy')
        .of(article.id)
        .add(user.id);
    }
  }

  async getUnreadCount(user: User): Promise<Record<string, number>> {
    const rows = await this.articleRepository
      .createQueryBuilder('article')
      .select('article.feedId', 'feedId')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('article.feed', 'feed')
      .leftJoin('feed.collection', 'collection')
      .leftJoin('article.readBy', 'readBy', 'readBy.id = :userId', { userId: user.id })
      .where(
        '(feed.ownerId = :userId OR collection.id IN (SELECT cm.collectionId FROM collection_members cm WHERE cm.userId = :userId AND cm.isActive = true))',
        { userId: user.id },
      )
      .andWhere('readBy.id IS NULL')
      .groupBy('article.feedId')
      .getRawMany<UnreadCountRow>();

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.feedId] = parseInt(row.count, 10);
      return acc;
    }, {});
  }

  async getFavorites(user: User): Promise<Article[]> {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.feed', 'feed')
      .leftJoinAndSelect('article.favoritedBy', 'favUser')
      .where('favUser.id = :userId', { userId: user.id })
      .orderBy('article.publishedAt', 'DESC')
      .getMany();
  }

  async createBulk(articles: CreateArticleDto[]): Promise<Article[]> {
    const existing = await this.articleRepository.find({
      where: { link: In(articles.map((a) => a.link)) },
    });

    const existingLinks = new Set(existing.map((a) => a.link));
    const newOnes = articles.filter((a) => !existingLinks.has(a.link));

    if (newOnes.length === 0) return existing;

    const created = await this.articleRepository.save(this.articleRepository.create(newOnes));

    return [...existing, ...created];
  }

  async deleteOldArticles(olderThanDays = 90): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    await this.articleRepository
      .createQueryBuilder()
      .delete()
      .where('publishedAt < :cutoffDate', { cutoffDate: cutoff })
      .execute();
  }
}
