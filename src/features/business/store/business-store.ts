// nativeApp\src\features\business\store\business-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
    DEFAULT_BUSINESS_ID,
    type IBusiness,
    LEGACY_DEMO_IDS,
    MAX_BUSINESSES,
    defaultBusinesses,
} from "@/features/business/data/business-options";
import { newId } from "@/lib/id";

export type NewBusiness = Omit<IBusiness, "id" | "createdAt">;

type BusinessState = {
    businesses: IBusiness[];
    activeId: string;
    setActive: (id: string) => void;
    /** Adds the business and makes it the active one. Returns null when MAX_BUSINESSES is reached. */
    addBusiness: (b: NewBusiness) => IBusiness | null;
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
            setActive: (activeId) => set({ activeId }),
            addBusiness: (b) => {
                if (get().businesses.length >= MAX_BUSINESSES) return null;
                const business: IBusiness = { ...b, id: newId(), createdAt: new Date().toISOString() };
                set((s) => ({ businesses: [...s.businesses, business], activeId: business.id }));
                return business;
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
