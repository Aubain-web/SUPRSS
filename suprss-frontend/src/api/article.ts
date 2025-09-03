import { http } from './http';
import type { Article, ArticleListResponse, UUID } from './types';

export type ArticleQuery = {
    feedIds?: UUID[];
    categories?: string[];
    isRead?: boolean;
    isFavorite?: boolean;
    search?: string;
    startDate?: string; // ISO
    endDate?: string;   // ISO
    page?: number;
    limit?: number;
};

export const ArticlesApi = {
    list(q: ArticleQuery = {}): Promise<ArticleListResponse> {
        const params: any = {};
        if (q.feedIds?.length) params.feedIds = q.feedIds.join(',');
        if (q.categories?.length) params.categories = q.categories.join(',');
        if (q.isRead !== undefined) params.isRead = String(q.isRead);
        if (q.isFavorite !== undefined) params.isFavorite = String(q.isFavorite);
        if (q.search) params.search = q.search;
        if (q.startDate) params.startDate = q.startDate;
        if (q.endDate) params.endDate = q.endDate;
        if (q.page) params.page = q.page;
        if (q.limit) params.limit = q.limit;

        return http.get<ArticleListResponse>('/articles', { params }).then(r => r.data);
    },
    unreadCount(): Promise<Record<string, number>> {
        return http.get<Record<string, number>>('/articles/unread-count').then(r => r.data);
    },
    favorites(): Promise<Article[]> {
        return http.get<Article[]>('/articles/favorites').then(r => r.data);
    },
    get(id: UUID): Promise<Article> {
        return http.get<Article>(`/articles/${id}`).then(r => r.data);
    },
    update(id: UUID, dto: Partial<Article>): Promise<Article> {
        return http.patch<Article>(`/articles/${id}`, dto).then(r => r.data);
    },
    remove(id: UUID): Promise<void> {
        return http.delete(`/articles/${id}`).then(() => undefined);
    },
    markAsRead(id: UUID): Promise<Article> {
        return http.post<Article>(`/articles/${id}/read`, {}).then(r => r.data);
    },
    markAsUnread(id: UUID): Promise<Article> {
        return http.delete<Article>(`/articles/${id}/read`).then(r => r.data);
    },
    toggleFavorite(id: UUID): Promise<Article> {
        return http.post<Article>(`/articles/${id}/favorite`, {}).then(r => r.data);
    },
    markAllAsRead(feedIds: UUID[]): Promise<void> {
        return http.post(`/articles/mark-all-read`, { feedIds }).then(() => undefined);
    },
};
