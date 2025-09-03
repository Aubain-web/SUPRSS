import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { type ArticleQuery, ArticlesApi } from '../api/article';
import type { ArticleListResponse, UUID } from '../api/types';

export function useArticles(q: ArticleQuery) {
    return useQuery<ArticleListResponse>({
        queryKey: ['articles', q],
        queryFn: () => ArticlesApi.list(q),
        placeholderData: keepPreviousData,
    });
}

export function useToggleArticleFavorite() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: UUID) => ArticlesApi.toggleFavorite(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['articles'] });
            qc.invalidateQueries({ queryKey: ['articles', 'favorites'] });
        },
    });
}

export function useMarkAllAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (feedIds: UUID[]) => ArticlesApi.markAllAsRead(feedIds),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
    });
}
