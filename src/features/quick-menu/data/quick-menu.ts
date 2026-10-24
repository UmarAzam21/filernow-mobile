// nativeApp\src\features\quick-menu\data\quick-menu.ts

import type { Href } from "expo-router";

import type { ServiceIconName } from "@/constants/service-icons";

/** A tile in the Quick Menu grid. No href → "coming soon" toast. `icon: "add"` draws the red plus tile. */
export type QuickAction = {
    id: string;
    label: string;
    icon: ServiceIconName | "add";
    href?: Href;
    premium?: boolean;
};

export const QUICK_ACTIONS: QuickAction[] = [
    { id: "add-expense", label: "Add Expense", icon: "add", href: "/khata/daily" },
    { id: "scan-receipt", label: "Scan Receipt", icon: "scanReceipt" },
    { id: "budgets", label: "Budgets", icon: "budget" },
    { id: "reports", label: "Reports", icon: "reports" },
    { id: "receipts", label: "Receipts", icon: "receipts" },
    { id: "savings", label: "Savings", icon: "savings" },
    { id: "categories", label: "Categories", icon: "categories" },
    { id: "ai-assistant", label: "AI Assistant", icon: "aiChat", premium: true },
];
