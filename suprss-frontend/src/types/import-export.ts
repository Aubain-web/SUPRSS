import type {RSSFeed} from "./feeds.ts";
import type {Collection} from "./collections.ts";

export interface ImportData {
    feeds: Omit<RSSFeed, 'id' | 'createdAt' | 'updatedAt'>[];
    collections?: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface ExportData {
    feeds: RSSFeed[];
    collections: Collection[];
    exportedAt: string;
    version: string;
}

export type ExportFormat = 'opml' | 'json' | 'csv';