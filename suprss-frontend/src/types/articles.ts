import type {User} from "./auth.ts";

export interface Article {
    id: string;
    title: string;
    link: string;
    description: string;
    content?: string;
    author?: string;
    publishedAt: string;
    feedId: string;
    feedName: string;
    isRead: boolean;
    isFavorite: boolean;
    categories: string[];
    comments: Comment[];
    createdAt: string;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    articleId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ArticleFilters {
    search?: string;
    feedId?: string;
    categories?: string[];
    isRead?: boolean;
    isFavorite?: boolean;
    dateFrom?: string;
    dateTo?: string;
}