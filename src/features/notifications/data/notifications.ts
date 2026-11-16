// nativeApp\src\features\notifications\data\notifications.ts

import type { ApiNotification, ApiNotificationCategory } from "../api/notifications-api";

export type NotificationKind = "alert" | "info";

/** Which icon + colours a notification gets (see `notification-look.ts`). */
export type NotificationLook =
    | "expense"
    | "income"
    | "card"
    | "transfer"
    | "balance"
    | "category"
    | "deleted"
    | "updated"
    | "budget"
    | "reminder"
    | "debt"
    | "business"
    | "email"
    | "security"
    | "alert"
    | "system";

export type INotification = {
    id: string;
    kind: NotificationKind;
    look: NotificationLook;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
};

const CATEGORY_KIND: Record<ApiNotificationCategory, NotificationKind> = {
    transactions: "info",
    alerts: "alert",
    reminders: "alert",
    security: "alert",
    system: "info",
};

const CATEGORY_LOOK: Record<ApiNotificationCategory, NotificationLook> = {
    transactions: "expense",
    alerts: "alert",
    reminders: "reminder",
    security: "security",
    system: "system",
};

/**
 * Picks the look from the notification's `type` (e.g. "card_added", "expense.created") and,
 * when the type is generic, its title. First match wins, so the specific words come first.
 */
const RULES: [RegExp, NotificationLook][] = [
    [/delet|remov/, "deleted"],
    [/transfer/, "transfer"],
    [/balance/, "balance"],
    [/card/, "card"],
    [/income|received|salary/, "income"],
    [/expense|spent|payment|paid/, "expense"],
    [/categor/, "category"],
    [/budget|limit|overspen/, "budget"],
    [/udhaar|debt|party|loan|owe/, "debt"],
    [/remind|due|recurring/, "reminder"],
    [/business/, "business"],
    [/email/, "email"],
    [/pin|login|sign.?in|password|device|security|biometric|fingerprint/, "security"],
    [/updat|edit|chang/, "updated"],
];

function lookFor(n: ApiNotification): NotificationLook {
    for (const source of [n.type, n.title]) {
        const text = (source ?? "").toLowerCase();
        const hit = RULES.find(([re]) => re.test(text));
        if (hit) return hit[1];
    }
    return CATEGORY_LOOK[n.category] ?? "system";
}

export function fromApiNotification(n: ApiNotification): INotification {
    return {
        id: n.id,
        // a high-priority message is an alert whatever its category
        kind: n.priority === "high" ? "alert" : (CATEGORY_KIND[n.category] ?? "info"),
        look: lookFor(n),
        title: n.title,
        body: n.body,
        createdAt: n.created_at,
        read: n.is_read,
    };
}
