// nativeApp\src\features\business\lib\business-name.ts

import i18n from "@/i18n";

import { DEFAULT_BUSINESS_ID, type IBusiness, defaultBusinesses } from "../data/business-options";

/** The name new accounts are registered with (see auth session); shown translated. */
export const DEFAULT_BUSINESS_NAME = defaultBusinesses.find((b) => b.id === DEFAULT_BUSINESS_ID)?.name ?? "My Expenses";

/**
 * Name to show for a business. The built-in "My Expenses" follows the app language until the
 * user renames it; names the user typed are shown as typed.
 * Components using this call useTranslation() so they re-render when the language changes.
 */
export function businessName(business: Pick<IBusiness, "id" | "name">) {
    // matched by name: after server sync the id is the server's, not DEFAULT_BUSINESS_ID
    return business.name === DEFAULT_BUSINESS_NAME ? i18n.t("business:myExpenses") : business.name;
}
