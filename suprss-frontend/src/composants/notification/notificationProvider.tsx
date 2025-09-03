import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useMe } from '../../hook/useAuth';
import { NotificationContext, type AppNotification } from './notificationContext';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: user } = useMe();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Demander la permission navigateur
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    // (Optionnel) recharger depuis une API quand l'utilisateur change
    useEffect(() => {
        // ex: await NotificationsApi.list().then(setNotifications).catch(() => {});
    }, [user?.id]);

    const push = useCallback((n: Omit<AppNotification, 'id' | 'createdAt'>) => {
        const item: AppNotification = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...n };
        setNotifications(prev => [item, ...prev].slice(0, 50));
        toast(n.title, { icon: '🔔' });

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(n.title, { body: n.body });
        }
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(x => ({ ...x, read: true })));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, push, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
}
