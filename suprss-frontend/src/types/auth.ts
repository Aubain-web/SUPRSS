export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
}