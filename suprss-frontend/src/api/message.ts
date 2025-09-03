import { http } from './http';
import type { Message, CreateMessageDto, UpdateMessageDto, UUID } from './types';

export const MessagesApi = {
    create(dto: CreateMessageDto): Promise<Message> {
        return http.post<Message>('/messages', dto).then(r => r.data);
    },
    update(id: UUID, dto: UpdateMessageDto): Promise<Message> {
        return http.patch<Message>(`/messages/${id}`, dto).then(r => r.data);
    },
    remove(id: UUID): Promise<void> {
        return http.delete(`/messages/${id}`).then(() => undefined);
    },
    byCollection(collectionId: UUID): Promise<Message[]> {
        return http.get<Message[]>(`/messages/collection/${collectionId}`).then(r => r.data);
    },
};
