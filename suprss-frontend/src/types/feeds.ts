export interface RSSFeed {
    id: string;
    name: string;
    url: string;
    description?: string;
    categories: string[];
    updateFrequency: UpdateFrequency;
    status: FeedStatus;
    lastUpdated: string;
    articleCount: number;
    collectionId?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export type UpdateFrequency = 'hourly' | '6hours' | 'daily' | 'weekly';
export type FeedStatus = 'active' | 'inactive' | 'error';