// nativeApp\src\constants\service-icons.ts

// Illustrated service icons, pre-rasterized to PNG from the SVG sources alongside them.
// The SVGs are too heavy to draw at runtime (pos.svg alone is 2.4 MB, staff.svg has 50 embedded bitmaps).
export const serviceIcons = {
    party: require("@/assets/images/service-icons/party.png"),
    cash: require("@/assets/images/service-icons/cash.png"),
    stock: require("@/assets/images/service-icons/stock.png"),
    bills: require("@/assets/images/service-icons/bills.png"),
    staff: require("@/assets/images/service-icons/staff.png"),
    expense: require("@/assets/images/service-icons/expense.png"),
    consultancy: require("@/assets/images/service-icons/consultancy.png"),
    invoicing: require("@/assets/images/service-icons/invoicing.png"),
    pos: require("@/assets/images/service-icons/pos.png"),
    manufacturing: require("@/assets/images/service-icons/manufacturing.png"),
    aiAssistant: require("@/assets/images/service-icons/ai-assistant.png"),
    accounting: require("@/assets/images/service-icons/accounting.png"),
    // Expense Manager set — 256px PNGs, background cleared to transparent.
    expenses: require("@/assets/images/service-icons/expenses.png"),
    budget: require("@/assets/images/service-icons/budget.png"),
    reports: require("@/assets/images/service-icons/reports.png"),
    receipts: require("@/assets/images/service-icons/receipts.png"),
    savings: require("@/assets/images/service-icons/savings.png"),
    categories: require("@/assets/images/service-icons/categories.png"),
    // Advanced Tools set — same treatment.
    aiChat: require("@/assets/images/service-icons/ai-chat.png"),
    scanReceipt: require("@/assets/images/service-icons/scan-receipt.png"),
    recurring: require("@/assets/images/service-icons/recurring.png"),
    multiCurrency: require("@/assets/images/service-icons/multi-currency.png"),
    exportPdf: require("@/assets/images/service-icons/export-pdf.png"),
    teamSharing: require("@/assets/images/service-icons/team-sharing.png"),
} as const;

export type ServiceIconName = keyof typeof serviceIcons;
