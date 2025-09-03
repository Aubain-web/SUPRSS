import { http } from './http';
import type {
    Collection,
    CollectionMember,
    Permission,
    UUID,
} from './types';

export type CreateCollectionDto = {
    name: string;
    description?: string;
};

export type UpdateCollectionDto = Partial<CreateCollectionDto>;

export type InviteMemberDto = {
    userId: UUID;
    permissions?: Permission[];
};

export const CollectionsApi = {
    create(dto: CreateCollectionDto): Promise<Collection> {
        return http.post<Collection>('/collections', dto).then(r => r.data);
    },
    list(): Promise<Collection[]> {
        return http.get<Collection[]>('/collections').then(r => r.data);
    },
    get(id: UUID): Promise<Collection> {
        return http.get<Collection>(`/collections/${id}`).then(r => r.data);
    },
    stats(id: UUID): Promise<{
        totalFeeds: number;
        totalArticles: number;
        unreadArticles: number;
        totalMembers: number;
    }> {
        return http.get(`/collections/${id}/stats`).then(r => r.data);
    },
    update(id: UUID, dto: UpdateCollectionDto): Promise<Collection> {
        return http.patch<Collection>(`/collections/${id}`, dto).then(r => r.data);
    },
    remove(id: UUID): Promise<void> {
        return http.delete(`/collections/${id}`).then(() => undefined);
    },
    invite(id: UUID, dto: InviteMemberDto): Promise<CollectionMember> {
        return http.post<CollectionMember>(`/collections/${id}/invite`, dto).then(r => r.data);
    },
    joinByInviteCode(inviteCode: string): Promise<Collection> {
        return http.post<Collection>(`/collections/join`, { inviteCode }).then(r => r.data);
    },
    updateMemberPermissions(
        id: UUID,
        memberId: UUID,
        permissions: Permission[],
    ): Promise<CollectionMember> {
        return http
            .patch<CollectionMember>(`/collections/${id}/members/${memberId}/permissions`, { permissions })
            .then(r => r.data);
    },
    removeMember(id: UUID, memberId: UUID): Promise<void> {
        return http.delete(`/collections/${id}/members/${memberId}`).then(() => undefined);
    },
    leave(id: UUID): Promise<void> {
        return http.post(`/collections/${id}/leave`, {}).then(() => undefined);
    },
    regenerateInvite(id: UUID): Promise<{ inviteCode: string }> {
        return http.post<{ inviteCode: string }>(`/collections/${id}/regenerate-invite`, {}).then(r => r.data);
    },
};
