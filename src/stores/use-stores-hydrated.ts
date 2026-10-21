// nativeApp\src\stores\use-stores-hydrated.ts

import { useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { useAppStore } from "@/stores/app-store";

const isReady = () =>
    useKhataStore.persist.hasHydrated() &&
    useAppStore.persist.hasHydrated() &&
    useAuthStore.persist.hasHydrated();

export function useStoresHydrated() {
    const [ready, setReady] = useState(isReady);

    useEffect(() => {
        const check = () => setReady(isReady());
        const offs = [
            useKhataStore.persist.onFinishHydration(check),
            useAppStore.persist.onFinishHydration(check),
            useAuthStore.persist.onFinishHydration(check),
        ];
        check();
        return () => offs.forEach((off) => off());
    }, []);

    return ready;
}