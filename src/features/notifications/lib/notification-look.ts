// nativeApp\src\features\notifications\lib\notification-look.ts

import { type EmIconName, emIcons } from "@/constants/expense-manager-icons";

import type { NotificationLook } from "../data/notifications";

/**
 * The app's own glossy 3D icon (same set as Home / More) and the soft tile behind it, so each kind
 * of notification is recognisable at a glance.
 */
export const NOTIFICATION_LOOK: Record<NotificationLook, { image: (typeof emIcons)[EmIconName]; tint: string }> = {
    expense: { image: emIcons.receipts, tint: "#F1ECFE" },
    income: { image: emIcons.businessCurrency, tint: "#FFF4DE" },
    card: { image: emIcons.expenseCard, tint: "#FFE9EC" },
    transfer: { image: emIcons.currency, tint: "#E7F0FE" },
    balance: { image: emIcons.wallet, tint: "#E3F6EE" },
    category: { image: emIcons.categories, tint: "#F0EEFB" },
    deleted: { image: emIcons.recycleBin, tint: "#FFE9EC" },
    updated: { image: emIcons.settings, tint: "#F1ECFE" },
    budget: { image: emIcons.budget, tint: "#F1ECFE" },
    reminder: { image: emIcons.recurring, tint: "#E6F2FC" },
    debt: { image: emIcons.shared, tint: "#F1ECFE" },
    business: { image: emIcons.reportsBars, tint: "#E7F0FE" },
    email: { image: emIcons.kyc, tint: "#E3F6EE" },
    security: { image: emIcons.appLock, tint: "#FFF4DE" },
    alert: { image: emIcons.budgetAlert, tint: "#FFF4DE" },
    system: { image: emIcons.bell, tint: "#FFE9EC" },
};
