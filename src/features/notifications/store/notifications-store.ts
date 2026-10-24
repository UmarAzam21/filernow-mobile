// nativeApp\src\features\notifications\store\notifications-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { type INotification, demoNotifications } from "@/features/notifications/data/notifications";

type NotificationsState = {
    items: INotification[];
    markRead: (id: string) => void;
    markAllRead: () => void;
};

export const useNotificationsStore = create<NotificationsState>()(
    persist(
        (set) => ({
            items: demoNotifications(),
            markRead: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
            markAllRead: () => set((s) => ({ items: s.items.map((n) => (n.read ? n : { ...n, read: true })) })),
        }),
        {
            name: "filernow-notifications",
            version: 1,
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

/** Number of unread notifications (a primitive, so selector-safe). */
export const useUnreadCount = () => useNotificationsStore((s) => s.items.filter((n) => !n.read).length);
