import type {User} from "./auth.ts";

export interface ChatMessage {
    id: string;
    content: string;
    author: User;
    collectionId: string;
    articleId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatRoom {
    id: string;
    collectionId: string;
    members: User[];
    messages: ChatMessage[];
    isActive: boolean;
}