import { http, setAccessToken } from './http';
import type { AuthLoginDto, AuthRegisterDto, AuthResponse, User } from './types';

export const AuthApi = {
    async register(dto: AuthRegisterDto): Promise<AuthResponse> {
        const { data } = await http.post<AuthResponse>('/auth/register', dto);
        setAccessToken(data.token);
        return data;
    },
    async login(dto: AuthLoginDto): Promise<AuthResponse> {
        const { data } = await http.post<AuthResponse>('/auth/login', dto);
        setAccessToken(data.token);
        return data;
    },
    async me(): Promise<User> {
        const { data } = await http.get<User>('/auth/me');
        return data;
    },
    // OAuth: rediriger le navigateur vers ces routes
    getGoogleUrl() {
        const base = (http.defaults.baseURL || '').replace(/\/$/, '');
        return `${base}/auth/google`;        // http://localhost:3001/suprss/api/auth/google
    },
    getGithubUrl() {
        const base = (http.defaults.baseURL || '').replace(/\/$/, '');
        return `${base}/auth/github`;
    }

};
