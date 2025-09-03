import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feed } from './feeds.entity';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { User } from '../user/user.entity';
import { RssService } from '../rss/rss.service';
import { CollectionsService } from '../collections/collection.service';
import { Permission } from '../collections/collection-members';

@Injectable()
export class FeedsService {
  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly rssService: RssService,
    private readonly collectionsService: CollectionsService,
  ) {}

  async create(createFeedDto: CreateFeedDto, user: User): Promise<Feed> {
    // Vérifier si l'URL est valide
    try {
      await this.rssService.validateRssFeed(createFeedDto.url);
    } catch (error) {
      throw new BadRequestException('Invalid RSS feed URL');
    }

    // Vérifier si l'utilisateur a les permissions pour ajouter dans cette collection
    if (createFeedDto.collectionId) {
      const hasPermission = await this.collectionsService.hasPermission(
        createFeedDto.collectionId,
        user.id,
        Permission.ADD_FEED,
      );
      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to add feeds to this collection');
      }
    }

    // Vérifier si l'URL existe déjà
    const existingFeed = await this.feedRepository.findOne({
      where: { url: createFeedDto.url },
    });
    if (existingFeed) {
      throw new BadRequestException('This RSS feed URL already exists');
    }

    const feed = this.feedRepository.create({
      ...createFeedDto,
      owner: user,
      ownerId: user.id,
    });

    const savedFeed = await this.feedRepository.save(feed);

    // Fetch initial articles
    await this.rssService.fetchFeedArticles(savedFeed);

    return this.findOne(savedFeed.id, user);
  }

  async findAll(user: User, collectionId?: string): Promise<Feed[]> {
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

  async findOne(id: string, user: User): Promise<Feed> {
    const feed = await this.feedRepository.findOne({
      where: { id },
      relations: ['owner', 'collection', 'articles'],
    });

    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    // Vérifier les permissions d'accès
    if (feed.ownerId !== user.id) {
      if (feed.collection) {
        const hasPermission = await this.collectionsService.hasPermission(
          feed.collection.id,
          user.id,
          Permission.READ,
        );
        if (!hasPermission) {
          throw new ForbiddenException('You do not have access to this feed');
        }
      } else {
        throw new ForbiddenException('You do not have access to this feed');
      }
    }

    return feed;
  }

  async update(id: string, updateFeedDto: UpdateFeedDto, user: User): Promise<Feed> {
    const feed = await this.findOne(id, user);

    // Vérifier les permissions de modification
    if (feed.ownerId !== user.id) {
      if (feed.collection) {
        const hasPermission = await this.collectionsService.hasPermission(
          feed.collection.id,
          user.id,
          Permission.EDIT_FEED,
        );
        if (!hasPermission) {
          throw new ForbiddenException('You do not have permission to edit this feed');
        }
      } else {
        throw new ForbiddenException('You do not have permission to edit this feed');
      }
    }

    // Valider la nouvelle URL si elle est modifiée
    if (updateFeedDto.url && updateFeedDto.url !== feed.url) {
      try {
        await this.rssService.validateRssFeed(updateFeedDto.url);
      } catch (error) {
        throw new BadRequestException('Invalid RSS feed URL');
      }

      // Vérifier si la nouvelle URL existe déjà
      const existingFeed = await this.feedRepository.findOne({
        where: { url: updateFeedDto.url },
      });
      if (existingFeed && existingFeed.id !== id) {
        throw new BadRequestException('This RSS feed URL already exists');
      }
    }

    await this.feedRepository.update(id, updateFeedDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const feed = await this.findOne(id, user);

    // Vérifier les permissions de suppression
    if (feed.ownerId !== user.id) {
      if (feed.collection) {
        const hasPermission = await this.collectionsService.hasPermission(
          feed.collection.id,
          user.id,
          Permission.DELETE_FEED,
        );
        if (!hasPermission) {
          throw new ForbiddenException('You do not have permission to delete this feed');
        }
      } else {
        throw new ForbiddenException('You do not have permission to delete this feed');
      }
    }

    await this.feedRepository.remove(feed);
  }

  async toggleFavorite(id: string, user: User): Promise<Feed> {
    const feed = await this.findOne(id, user);

    const favoriteIndex = feed.favoritedBy.findIndex((u) => u.id === user.id);
    if (favoriteIndex > -1) {
      feed.favoritedBy.splice(favoriteIndex, 1);
    } else {
      feed.favoritedBy.push(user);
    }

    await this.feedRepository.save(feed);
    return this.findOne(id, user);
  }

  async getFavorites(user: User): Promise<Feed[]> {
    return this.feedRepository
      .createQueryBuilder('feed')
      .leftJoinAndSelect('feed.favoritedBy', 'user')
      .leftJoinAndSelect('feed.owner', 'owner')
      .leftJoinAndSelect('feed.collection', 'collection')
      .where('user.id = :userId', { userId: user.id })
      .orderBy('feed.createdAt', 'DESC')
      .getMany();
  }

  async findByTags(tags: string[], user: User): Promise<Feed[]> {
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

  async updateLastFetch(id: string, error?: string): Promise<void> {
    const updateData: any = {
      lastFetchedAt: new Date(),
    };

    if (error) {
      updateData.lastErrorAt = new Date();
      updateData.lastError = error;
    } else {
      updateData.lastError = null;
      updateData.lastErrorAt = null;
    }

    await this.feedRepository.update(id, updateData);
  }

  async getActiveFeeds(): Promise<Feed[]> {
    return this.feedRepository.find({
      where: { isActive: true },
      relations: ['owner'],
    });
  }
}
