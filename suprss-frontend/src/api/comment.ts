import { http } from './http';
import type { Comment, CreateCommentDto, UpdateCommentDto, UUID } from './types';

export const CommentsApi = {
    create(dto: CreateCommentDto): Promise<Comment> {
        return http.post<Comment>('/comments', dto).then(r => r.data);
    },
    update(id: UUID, dto: UpdateCommentDto): Promise<Comment> {
        return http.patch<Comment>(`/comments/${id}`, dto).then(r => r.data);
    },
    remove(id: UUID): Promise<void> {
        return http.delete(`/comments/${id}`).then(() => undefined);
    },
    byArticle(articleId: UUID): Promise<Comment[]> {
        return http.get<Comment[]>(`/comments/article/${articleId}`).then(r => r.data);
    },
};
