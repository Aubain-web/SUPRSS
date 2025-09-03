import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Feed } from '../feeds/feeds.entity';
import { RssParserService } from './rss-paper.service';
import { ArticlesService } from '../articles/article.service';

// Doit matcher CreateArticleDto
type CreateArticleInput = {
  title: string;
  link: string;
  author?: string;
  description?: string;
  content?: string;
  publishedAt: string; // ISO string (IsDateString)
  imageUrl?: string; // URL string
  categories?: string[];
  feedId: string;
};

// Représentation minimale d’un item RSS pour éviter le any
type ParsedItem = {
  title?: unknown;
  link?: unknown;
  creator?: unknown;
  author?: unknown;
  contentSnippet?: unknown;
  summary?: unknown;
  content?: unknown;
  description?: unknown;
  pubDate?: unknown;
  enclosure?: unknown;
  image?: unknown;
  ['media:thumbnail']?: unknown;
  ['media:content']?: unknown;
  categories?: unknown;
};

function toStringOrUndefined(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function toISODateStringOrNow(v: unknown): string {
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}
function toStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) {
    const arr = v.filter((x): x is string => typeof x === 'string');
    return arr.length ? arr : undefined;
  }
  return undefined;
}
function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly rssParserService: RssParserService,
    private readonly articlesService: ArticlesService,
  ) {}

  async validateRssFeed(url: string): Promise<boolean> {
    try {
      const feed = await this.rssParserService.parseFeed(url);
      return Boolean((feed as { title?: unknown })?.title);
    } catch (error: unknown) {
      this.logger.error(`Failed to validate RSS feed ${url}: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async fetchFeedArticles(feed: Feed): Promise<void> {
    try {
      this.logger.log(`Fetching articles for feed: ${feed.title} (${feed.url})`);

      const parsedFeed = (await this.rssParserService.parseFeed(feed.url)) as {
        items?: ParsedItem[];
      };

      if (!parsedFeed.items || parsedFeed.items.length === 0) {
        this.logger.warn(`No articles found for feed: ${feed.title}`);
        await this.updateFeedStatus(feed.id, null);
        return;
      }

      const articles: CreateArticleInput[] = parsedFeed.items.map((item) => {
        const title = toStringOrUndefined(item.title) ?? 'Untitled';
        const link = toStringOrUndefined(item.link) ?? '';

        const author =
          toStringOrUndefined(item.creator) ?? toStringOrUndefined(item.author) ?? undefined;

        const description =
          toStringOrUndefined(item.contentSnippet) ??
          toStringOrUndefined(item.summary) ??
          undefined;

        const content =
          toStringOrUndefined(item.content) ?? toStringOrUndefined(item.description) ?? undefined;

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
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch articles for feed ${feed.title} (${feed.url}): ${getErrorMessage(error)}`,
      );
      await this.updateFeedStatus(feed.id, getErrorMessage(error));
    }
  }

  private extractImageUrl(item: ParsedItem): string | undefined {
    // enclosure
    const enclosure = item.enclosure as { url?: unknown; type?: unknown } | undefined;
    if (
      enclosure &&
      typeof enclosure.url === 'string' &&
      typeof enclosure.type === 'string' &&
      enclosure.type.includes('image')
    ) {
      return enclosure.url;
    }

    // image.url
    const image = item.image as { url?: unknown } | undefined;
    if (image && typeof image.url === 'string') return image.url;

    // media:thumbnail.url
    const thumb = item['media:thumbnail'] as { url?: unknown } | undefined;
    if (thumb && typeof thumb.url === 'string') return thumb.url;

    // media:content.url
    const media = item['media:content'] as { url?: unknown; type?: unknown } | undefined;
    if (
      media &&
      typeof media.url === 'string' &&
      typeof media.type === 'string' &&
      media.type.includes('image')
    ) {
      return media.url;
    }

    // <img ... src="...">
    const content = toStringOrUndefined(item.content);
    if (content) {
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) return imgMatch[1];
    }

    return undefined;
  }

  private async updateFeedStatus(feedId: string, error: string | null): Promise<void> {
    const now = new Date();

    if (error) {
      // Cas erreur: on met à jour lastFetchedAt, lastErrorAt (date), lastError (message)
      await this.feedRepository
        .createQueryBuilder()
        .update(Feed)
        .set({
          lastFetchedAt: now,
          lastErrorAt: now,
          lastError: error,
        })
        .where('id = :id', { id: feedId })
        .execute();
    } else {
      // Cas OK: on remet lastError* à NULL proprement côté SQL
      await this.feedRepository
        .createQueryBuilder()
        .update(Feed)
        .set({
          lastFetchedAt: now,
          // Important: pour NULL il faut une fonction SQL, pas `null` en JS
          lastErrorAt: () => 'NULL',
          lastError: () => 'NULL',
        })
        .where('id = :id', { id: feedId })
        .execute();
    }
  }

  private shouldUpdateFeed(feed: Feed): boolean {
    if (!feed.lastFetchedAt) return true;
    const now = Date.now();
    const last = new Date(feed.lastFetchedAt).getTime();
    const delta = now - last;
    const interval = (feed.updateFrequency ?? 3600) * 1000;
    return delta >= interval;
  }

  async forceUpdateFeed(feedId: string): Promise<void> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId }, relations: ['owner'] });
    if (!feed) throw new Error('Feed not found');
    await this.fetchFeedArticles(feed);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldArticles(): Promise<void> {
    this.logger.log('Starting cleanup of old articles');
    try {
      await this.articlesService.deleteOldArticles(90);
      this.logger.log('Completed cleanup of old articles');
    } catch (error: unknown) {
      this.logger.error(`Error during articles cleanup: ${getErrorMessage(error)}`);
    }
  }
}
