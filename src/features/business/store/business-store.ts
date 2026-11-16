// nativeApp\src\features\business\store\business-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
    BUSINESS_TYPE_KEYS,
    CURRENCIES,
    DEFAULT_BUSINESS_ID,
    type BusinessType,
    type CurrencyCode,
    type IBusiness,
    LEGACY_DEMO_IDS,
    MAX_BUSINESSES,
    defaultBusinesses,
} from "@/features/business/data/business-options";

export type NewBusiness = Omit<IBusiness, "id" | "createdAt">;

/** A business as the backend sends it (see auth-api ApiBusiness); kept structural to avoid a feature import cycle. */
type ServerBusiness = { id: number; business_name: string; business_type: string; currency: string; created_at: string };

const asType = (t: string): BusinessType => (BUSINESS_TYPE_KEYS as string[]).includes(t) ? (t as BusinessType) : "shop";
const asCurrency = (c: string): CurrencyCode =>
    CURRENCIES.some((x) => x.code === c.toUpperCase()) ? (c.toUpperCase() as CurrencyCode) : "PKR";

type BusinessState = {
    businesses: IBusiness[];
    activeId: string;
    /**
     * Replaces the list with the server's (ids become the server ids as strings) and selects the
     * server's active business. Theme colours are local-only, so they're kept per id.
     */
    syncFromServer: (list: ServerBusiness[], activeServerId: number | null) => void;
    // Adding and switching go through the API (auth/lib/session) so the token follows the business.
    updateBusiness: (id: string, patch: Partial<NewBusiness>) => void;
    /** Removes a business; the last remaining one can't be deleted (returns false). */
    deleteBusiness: (id: string) => boolean;
};

type Persisted = Pick<BusinessState, "businesses" | "activeId">;

export const useBusinessStore = create<BusinessState>()(
    persist(
        (set, get) => ({
            businesses: defaultBusinesses,
            activeId: DEFAULT_BUSINESS_ID,
            syncFromServer: (list, activeServerId) => {
                if (list.length === 0) return;
                const local = get().businesses;
                const businesses: IBusiness[] = list.map((b) => {
                    const id = String(b.id);
                    return {
                        id,
                        name: b.business_name,
                        type: asType(b.business_type),
                        currency: asCurrency(b.currency),
                        theme: local.find((l) => l.id === id)?.theme ?? "red",
                        createdAt: b.created_at,
                    };
                });
                const active = String(activeServerId ?? list[0].id);
                set({ businesses, activeId: businesses.some((b) => b.id === active) ? active : businesses[0].id });
            },
            updateBusiness: (id, patch) =>
                set((s) => ({ businesses: s.businesses.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
            deleteBusiness: (id) => {
                const { businesses, activeId } = get();
                if (businesses.length <= 1) return false;
                const rest = businesses.filter((b) => b.id !== id);
                set({ businesses: rest, activeId: activeId === id ? rest[0].id : activeId });
                return true;
            },
        }),
        {
            name: "filernow-business",
            version: 2,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s): Persisted => ({ businesses: s.businesses, activeId: s.activeId }),
            // v1 shipped 4 demo businesses; drop them and enforce the limit, keeping the user's own.
            migrate: (persisted, version) => {
                const state = persisted as Persisted;
                if (version < 2) {
                    const kept = state.businesses.filter((b) => !LEGACY_DEMO_IDS.includes(b.id)).slice(0, MAX_BUSINESSES);
                    const businesses = kept.length ? kept : defaultBusinesses;
                    const activeId = businesses.some((b) => b.id === state.activeId) ? state.activeId : businesses[0].id;
                    return { businesses, activeId };
                }
                return state;
            },
        },
    ),
);

/** The currently selected business (falls back to the first one). Returns a stored reference, so it is selector-safe. */
export const useActiveBusiness = () =>
    useBusinessStore((s) => s.businesses.find((b) => b.id === s.activeId) ?? s.businesses[0]);
