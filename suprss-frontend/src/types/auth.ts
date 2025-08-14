export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    articlesPerPage: number;
    autoRefresh: boolean;
    refreshInterval: number;
    notifications: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}