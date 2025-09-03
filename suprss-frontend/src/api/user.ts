// src/api/users.ts
import { http } from './http';
import type { User } from './types';

export const UsersApi = {
    async updateProfile(body: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User> {
        const { data } = await http.put<User>('/users/me', body);
        return data;
    },
    async updatePreferences(body: Pick<User, 'darkMode' | 'fontSize' | 'language'>): Promise<User> {
        const { data } = await http.put<User>('/users/me/preferences', body);
        return data;
    },
    async changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true }> {
        const { data } = await http.post<{ ok: true }>('/users/me/change-password', {
            currentPassword,
            newPassword,
        });
        return data;
    },
};
