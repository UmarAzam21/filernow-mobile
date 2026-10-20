// nativeApp\src\stores\use-stores-hydrated.ts

import { useEffect, useState } from "react";

import { useKhataStore } from "@/features/khata/store/khata-store";
import { useAppStore } from "@/stores/app-store";

const isReady = () => useKhataStore.persist.hasHydrated() && useAppStore.persist.hasHydrated();

export function useStoresHydrated() {
    const [ready, setReady] = useState(isReady);

    useEffect(() => {
        const check = () => setReady(isReady());
        const offKhata = useKhataStore.persist.onFinishHydration(check);
        const offApp = useAppStore.persist.onFinishHydration(check);
        check();
        return () => {
            offKhata();
            offApp();
        };
    }, []);

    return ready;
}