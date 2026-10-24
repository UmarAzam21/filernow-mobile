// nativeApp\src\features\notifications\data\notifications.ts

import type { ServiceIconName } from "@/constants/service-icons";

export type NotificationKind = "alert" | "info";

export type INotification = {
    id: string;
    kind: NotificationKind;
    /** Illustrated icon, or an emoji when there is no illustration for it. */
    icon: { image: ServiceIconName } | { emoji: string };
    /** Background of the rounded icon tile. */
    tint: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
};

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

// Demo feed until the backend sends real notifications.
export const demoNotifications = (): INotification[] => [
    {
        id: "budget-90",
        kind: "alert",
        icon: { emoji: "⚠️" },
        tint: "#FFF1DC",
        title: "Budget almost reached",
        body: "Food & Dining is at 90% of this month's budget.",
        createdAt: ago(10),
        read: false,
    },
    {
        id: "expense-added",
        kind: "info",
        icon: { image: "expenses" },
        tint: "#E3F6EE",
        title: "Expense added",
        body: "Rs 2,450 spent at Imtiaz Super Market.",
        createdAt: ago(120),
        read: false,
    },
    {
        id: "bill-due",
        kind: "alert",
        icon: { image: "recurring" },
        tint: "#EEE9FF",
        title: "Recurring bill due tomorrow",
        body: "Electricity bill · Rs 8,200 is due on 24 Oct.",
        createdAt: ago(300),
        read: false,
    },
    {
        id: "weekly-report",
        kind: "info",
        icon: { image: "reports" },
        tint: "#E4EFFF",
        title: "Weekly report is ready",
        body: "You saved 12% more than last week. Nice work!",
        createdAt: ago(60 * 26),
        read: true,
    },
    {
        id: "savings-goal",
        kind: "info",
        icon: { image: "savings" },
        tint: "#FFF4D6",
        title: "Savings goal reached",
        body: "You hit your “New Phone” goal of Rs 60,000.",
        createdAt: ago(60 * 50),
        read: true,
    },
];
