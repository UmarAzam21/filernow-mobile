// nativeApp\src\features\notifications\api\notifications-api.ts

import { apiRequest } from "@/lib/api/client";

export type ApiNotificationCategory = "transactions" | "alerts" | "reminders" | "security" | "system";

export type ApiNotification = {
    id: string;
    type: string;
    category: ApiNotificationCategory;
    priority: string;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
    action_url?: string | null;
    business_id?: number | null;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
};

export type NotificationList = { items: ApiNotification[]; next_cursor: string | null; unread_count: number };

export type NotificationPreference = {
    category: ApiNotificationCategory;
    label: string;
    push_enabled: boolean;
    /** Can't be turned off (e.g. security). */
    locked: boolean;
};

type ReadResult = { updated: number; unread_count: number };

const BASE = "/api/expenses/notifications";

export const notificationsApi = {
    list: (
        params: {
            limit?: number;
            cursor?: string | null;
            unreadOnly?: boolean;
            category?: ApiNotificationCategory;
        } = {},
    ) =>
        apiRequest<NotificationList>(BASE, {
            query: {
                limit: params.limit,
                cursor: params.cursor,
                unread_only: params.unreadOnly,
                category: params.category,
            },
        }),

    unreadCount: () => apiRequest<{ unread_count: number; total_unread_count: number }>(`${BASE}/unread-count`),

    markRead: (ids: string[]) => apiRequest<ReadResult>(`${BASE}/read`, { method: "POST", json: { ids } }),

    markAllRead: () => apiRequest<ReadResult>(`${BASE}/read-all`, { method: "POST" }),

    remove: (id: string) => apiRequest<void>(`${BASE}/${id}`, { method: "DELETE", responseType: "none" }),

    preferences: () => apiRequest<NotificationPreference[]>(`${BASE}/preferences`),

    updatePreference: (category: ApiNotificationCategory, pushEnabled: boolean) =>
        apiRequest<NotificationPreference[]>(`${BASE}/preferences/${category}`, {
            method: "PUT",
            json: { push_enabled: pushEnabled },
        }),

    /** Push devices need an FCM token (expo-notifications + Firebase), not set up in the app yet. */
    registerDevice: (token: string, platform: "android" | "ios" | "web") =>
        apiRequest<{ id: number }>(`${BASE}/devices`, { method: "POST", json: { token, platform } }),

    unregisterDevice: (deviceId: number) =>
        apiRequest<void>(`${BASE}/devices/${deviceId}`, { method: "DELETE", responseType: "none" }),

    sendTest: () => apiRequest<void>(`${BASE}/test`, { method: "POST", responseType: "none" }),
};
