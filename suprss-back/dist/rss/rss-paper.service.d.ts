import { Output } from 'rss-parser';
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
    'media:thumbnail'?: {
        $: {
            url: string;
        };
    };
    'media:content'?: {
        $: {
            url: string;
        };
    };
    'content:encoded'?: string;
    [key: string]: any;
};
type RssFeed = Output<RssItem>;
export declare class RssParserService {
    private parser;
    constructor();
    parseFeed(url: string): Promise<RssFeed>;
    parseFeedFromString(xml: string): Promise<RssFeed>;
}
export {};
