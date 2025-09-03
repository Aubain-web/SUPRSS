import { http } from './http';
import type { Feed, CreateFeedDto, UpdateFeedDto, UUID } from './types';

export const FeedsApi = {
    create(dto: CreateFeedDto): Promise<Feed> {
        return http.post<Feed>('/feeds', dto).then(r => r.data);
    },
    list(collectionId?: UUID): Promise<Feed[]> {
        const params = collectionId ? { collectionId } : undefined;
        return http.get<Feed[]>('/feeds', { params }).then(r => r.data);
    },
    favorites(): Promise<Feed[]> {
        return http.get<Feed[]>('/feeds/favorites').then(r => r.data);
    },
    findByTags(tags: string[]): Promise<Feed[]> {
        return http.get<Feed[]>('/feeds/by-tags', { params: { tags: tags.join(',') } }).then(r => r.data);
    },
    get(id: UUID): Promise<Feed> {
        return http.get<Feed>(`/feeds/${id}`).then(r => r.data);
    },
    update(id: UUID, dto: UpdateFeedDto): Promise<Feed> {
        return http.patch<Feed>(`/feeds/${id}`, dto).then(r => r.data);
    },
    remove(id: UUID): Promise<void> {
        return http.delete(`/feeds/${id}`).then(() => undefined);
    },
    toggleFavorite(id: UUID): Promise<void> {
        return http.post(`/feeds/${id}/favorite`, {}).then(() => undefined);
    },
    async getOne(id: UUID): Promise<Feed> {
        const { data } = await http.get<Feed>(`/feeds/${id}`);
        return data;
    },
    async refresh(id: UUID): Promise<void> {
        await http.post(`/feeds/${id}/refresh`);
    },
};
