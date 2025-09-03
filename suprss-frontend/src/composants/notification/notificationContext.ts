import { createContext } from 'react';

export type AppNotification = {
    id: string;
    title: string;
    body?: string;
    createdAt: string;
    read?: boolean;
};

export type NotificationContextValue = {
    notifications: AppNotification[];
    push: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
    markAllRead: () => void;
};

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
