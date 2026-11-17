// nativeApp\src\features\khata\hooks\use-business-data.ts

import { useMemo } from "react";

import { useBusinessStore } from "@/features/business/store/business-store";
import { EMPTY_LOCAL, EMPTY_REMOTE, useKhataStore } from "@/features/khata/store/khata-store";
import type { ICard, IExpenseEntry, IParty } from "@/features/khata/types";

export type BusinessData = { entries: IExpenseEntry[]; parties: IParty[]; cards: ICard[] };

/**
 * Entries, parties and cards of the ACTIVE business. Re-renders when it switches.
 * Entries = server income/expense + this phone's Udhaar; cards come from the server.
 */
export function useBusinessData(): BusinessData {
    const businessId = useBusinessStore((s) => s.activeId);
    const local = useKhataStore((s) => s.data[businessId] ?? EMPTY_LOCAL);
    const remote = useKhataStore((s) => s.remote[businessId] ?? EMPTY_REMOTE);
    return useMemo(
        () => ({ entries: [...remote.entries, ...local.entries], parties: local.parties, cards: remote.cards }),
        [local, remote],
    );
}
