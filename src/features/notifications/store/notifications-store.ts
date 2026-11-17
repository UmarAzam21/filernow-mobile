// nativeApp\src\features\notifications\store\notifications-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { apiErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";

import { notificationsApi } from "../api/notifications-api";
import { type INotification, fromApiNotification } from "../data/notifications";

const PAGE_SIZE = 30;

// the pre-backend demo feed was persisted here; drop it
AsyncStorage.removeItem("filernow-notifications").catch(() => {});

type NotificationsState = {
    items: INotification[];
    /** Server's unread count (drives the bell badge). */
    unread: number;
    nextCursor: string | null;
    loading: boolean;
    error: string | null;
    /** Reloads the first page (sheet opened / pull to refresh). */
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
    markRead: (id: string) => void;
    markAllRead: () => void;
    remove: (id: string) => void;
    reset: () => void;
};

const INITIAL = { items: [], unread: 0, nextCursor: null, loading: false, error: null };

// Not persisted: the server is the source of truth; the list is fetched when the sheet opens.
export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
    ...INITIAL,

    refresh: async () => {
        set({ loading: true, error: null });
        try {
            const res = await notificationsApi.list({ limit: PAGE_SIZE });
            set({ items: res.items.map(fromApiNotification), nextCursor: res.next_cursor, unread: res.unread_count });
        } catch (e) {
            set({ error: apiErrorMessage(e) });
        } finally {
            set({ loading: false });
        }
    },

    loadMore: async () => {
        const { nextCursor, loading } = get();
        if (!nextCursor || loading) return;
        set({ loading: true });
        try {
            const res = await notificationsApi.list({ limit: PAGE_SIZE, cursor: nextCursor });
            const seen = new Set(get().items.map((n) => n.id));
            set((s) => ({
                items: [...s.items, ...res.items.map(fromApiNotification).filter((n) => !seen.has(n.id))],
                nextCursor: res.next_cursor,
                unread: res.unread_count,
            }));
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally {
            set({ loading: false });
        }
    },

    refreshUnreadCount: async () => {
        try {
            const { unread_count } = await notificationsApi.unreadCount();
            set({ unread: unread_count });
        } catch {
            // badge only; keep the last known count
        }
    },

    // Optimistic: update the list now, roll back from the server if the call fails.
    markRead: (id) => {
        const item = get().items.find((n) => n.id === id);
        if (!item || item.read) return;
        set((s) => ({
            items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unread: Math.max(0, s.unread - 1),
        }));
        notificationsApi
            .markRead([id])
            .then((r) => set({ unread: r.unread_count }))
            .catch(() => get().refresh());
    },

    markAllRead: () => {
        set((s) => ({ items: s.items.map((n) => (n.read ? n : { ...n, read: true })), unread: 0 }));
        notificationsApi
            .markAllRead()
            .then((r) => set({ unread: r.unread_count }))
            .catch((e) => {
                toast.error(apiErrorMessage(e));
                get().refresh();
            });
    },

    remove: (id) => {
        const item = get().items.find((n) => n.id === id);
        if (!item) return;
        set((s) => ({
            items: s.items.filter((n) => n.id !== id),
            unread: item.read ? s.unread : Math.max(0, s.unread - 1),
        }));
        notificationsApi.remove(id).catch((e) => {
            toast.error(apiErrorMessage(e));
            get().refresh();
        });
    },

    reset: () => set(INITIAL),
}));

/** Number of unread notifications (a primitive, so selector-safe). */
export const useUnreadCount = () => useNotificationsStore((s) => s.unread);
