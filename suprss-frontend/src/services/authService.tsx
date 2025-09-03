import { AuthApi } from '../api/auth';
import { setAccessToken } from '../api/http';
import type { User } from '../api/types';
import {UsersApi} from "../api/user.ts";

class AuthService {
    async login(email: string, password: string) {
        const res = await AuthApi.login({ email, password });
        localStorage.setItem('token', res.token);
        setAccessToken(res.token);
        return res; // { user, token }
    }

    async register(email: string, password: string, username: string) {
        // ton backend attend { firstName, lastName } d’après les types, on mappe "username" dessus
        const res = await AuthApi.register({
            email,
            password,
            firstName: username,
            lastName: '',
        });
        localStorage.setItem('token', res.token);
        setAccessToken(res.token);
        return res; // { user, token }
    }

    async verifyToken(token: string): Promise<User> {
        setAccessToken(token);
        return AuthApi.me(); // si le token est invalide, ça throw -> tu gères au dessus
    }

    // À n’utiliser que si ton backend expose /auth/refresh (sinon -> Not implemented)
    async refreshToken() {
        throw new Error('refreshToken non implémenté côté API');
    }

    async updateUser(userData: Partial<User>) {
        const user = await UsersApi.updateProfile(userData);
        return user;
    }

    async changePassword(currentPassword: string, newPassword: string) {
        await UsersApi.changePassword(currentPassword, newPassword);
    }

    async logout() {
        localStorage.removeItem('token');
        setAccessToken();
    }

    getOAuthURL(provider: 'google' | 'github') {
        // s’appuie sur http.defaults.baseURL configuré dans src/api/http.ts
        return provider === 'google' ? AuthApi.getGoogleUrl() : AuthApi.getGithubUrl();
    }

    redirectToOAuth(provider: 'google' | 'github' | 'microsoft') {
        if (provider === 'google') window.location.href = AuthApi.getGoogleUrl();
        else if (provider === 'github') window.location.href = AuthApi.getGithubUrl();
        else window.location.href = '/not-implemented';
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService();
