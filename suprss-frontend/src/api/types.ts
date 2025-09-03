export type UUID = string;

export type User = {
    id: UUID;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large' | string;
    language: string;
    createdAt: string;
    updatedAt: string;
};

export type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
};

export type AuthLoginDto = { email: string; password: string };
export type AuthRegisterDto = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};
export type AuthResponse = { user: User; token: string };

export type Feed = {
    id: UUID;
    title: string;
    url: string;
    description?: string | null;
    tags?: string[];
    isActive: boolean;
    updateFrequency: number;
    lastFetchedAt?: string | null;
    lastErrorAt?: string | null;
    lastError?: string | null;
    ownerId: UUID;
    collectionId?: UUID | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateFeedDto = {
    title: string;
    url: string;
    description?: string;
    tags?: string[];
    collectionId?: UUID;
    updateFrequency?: number;
};
export type UpdateFeedDto = Partial<CreateFeedDto>;

export type Article = {
    id: UUID;
    title: string;
    link: string;
    author?: string;
    description?: string;
    content?: string;
    publishedAt: string;
    imageUrl?: string;
    categories?: string[];
    feedId: UUID;
    createdAt: string;
    updatedAt: string;
};
export type ArticleListResponse = {
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
};

export type Comment = {
    id: UUID;
    content: string;
    articleId: UUID;
    authorId: UUID;
    createdAt: string;
    updatedAt: string;
};
export type CreateCommentDto = { articleId: UUID; content: string };
export type UpdateCommentDto = { content: string };

export type Message = {
    id: UUID;
    content: string;
    collectionId: UUID;
    authorId: UUID;
    createdAt: string;
    updatedAt: string;
};
export type CreateMessageDto = { collectionId: UUID; content: string };
export type UpdateMessageDto = { content: string };

export type Collection = {
    id: UUID;
    name: string;
    description?: string | null;
    ownerId: UUID;
    inviteCode?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Permission = 'READ' | 'WRITE' | 'ADMIN';
export const PERMISSIONS = ['READ', 'WRITE', 'ADMIN'] as const;

export type CollectionMember = {
    id: UUID;
    collectionId: UUID;
    userId: UUID;
    isActive: boolean;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
};
