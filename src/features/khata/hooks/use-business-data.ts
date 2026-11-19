// nativeApp\src\features\khata\hooks\use-business-data.ts

import { useMemo } from "react";

import { useBusinessStore } from "@/features/business/store/business-store";
import { EMPTY_DEMO_DATA, EMPTY_LOCAL, EMPTY_REMOTE, type DataMode, useKhataStore } from "@/features/khata/store/khata-store";
import type { ICard, ICategory, IExpenseEntry, IParty } from "@/features/khata/types";

export type BusinessData = { entries: IExpenseEntry[]; parties: IParty[]; cards: ICard[]; categories: ICategory[]; dataMode: DataMode };

/** Active business data, or its isolated editable fixtures while demo mode is enabled. */
export function useBusinessData(): BusinessData {
    const businessId = useBusinessStore((s) => s.activeId);
    const local = useKhataStore((s) => s.data[businessId] ?? EMPTY_LOCAL);
    const remote = useKhataStore((s) => s.remote[businessId] ?? EMPTY_REMOTE);
    const demo = useKhataStore((s) => s.demoData[businessId] ?? EMPTY_DEMO_DATA);
    const categories = useKhataStore((s) => s.categories);
    const dataMode = useKhataStore((s) => s.dataMode[businessId] ?? "blank");
    return useMemo(
        () =>
            dataMode === "demo"
                ? { entries: demo.entries, parties: demo.parties, cards: demo.cards, categories: demo.categories, dataMode }
                : {
                      entries: [...remote.entries, ...local.entries],
                      parties: local.parties,
                      cards: remote.cards,
                      categories,
                      dataMode,
                  },
        [local, remote, demo, categories, dataMode],
    );
}
