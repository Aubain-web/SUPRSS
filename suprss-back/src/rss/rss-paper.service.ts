import { Injectable } from '@nestjs/common';
import Parser, { Output } from 'rss-parser'; // <-- default import

type RssItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  enclosure?: any;
  categories?: string[];
  'media:thumbnail'?: { $: { url: string } };
  'media:content'?: { $: { url: string } };
  'content:encoded'?: string;
  [key: string]: any;
};

type RssFeed = Output<RssItem>;

@Injectable()
export class RssParserService {
  private parser: Parser<RssItem>;

  constructor() {
    this.parser = new Parser<RssItem>({
      timeout: 10000,
      headers: {
        'User-Agent': 'SUPRSS/1.0 RSS Reader',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      customFields: {
        feed: ['language', 'copyright', 'managingEditor', 'webMaster', 'generator'],
        item: [
          'summary',
          'content',
          'contentSnippet',
          'enclosure',
          'creator',
          'author',
          'categories',
          ['media:thumbnail', 'media:thumbnail'],
          ['media:content', 'media:content'],
          ['content:encoded', 'content:encoded'],
        ],
      },
    });
  }

  async parseFeed(url: string): Promise<RssFeed> {
    return this.parser.parseURL(url);
  }

  async parseFeedFromString(xml: string): Promise<RssFeed> {
    return this.parser.parseString(xml);
  }
}
