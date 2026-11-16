// nativeApp\src\stores\use-stores-hydrated.ts

import { useEffect, useState } from "react";

import { refreshSession } from "@/features/auth/lib/session";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { useAppStore } from "@/stores/app-store";

const isReady = () =>
    useKhataStore.persist.hasHydrated() &&
    useAppStore.persist.hasHydrated() &&
    useAuthStore.persist.hasHydrated() &&
    useBusinessStore.persist.hasHydrated() &&
    // the API token lives in secure storage, read separately from the persisted stores
    useAuthStore.getState().sessionLoaded;

/** True once every persisted store and the stored session are loaded (the splash screen waits for it). */
export function useStoresHydrated() {
    const [ready, setReady] = useState(isReady);

    useEffect(() => {
        const check = () => setReady(isReady());
        const offs = [
            useKhataStore.persist.onFinishHydration(check),
            useAppStore.persist.onFinishHydration(check),
            useAuthStore.persist.onFinishHydration(check),
            useBusinessStore.persist.onFinishHydration(check),
        ];
        // after the persisted phone is in place: read the token, then check it with the server
        // in the background (a 401 signs out; offline keeps the cached session)
        const startSession = async () => {
            if (!useAuthStore.persist.hasHydrated())
                await new Promise<void>((r) => offs.push(useAuthStore.persist.onFinishHydration(() => r())));
            await useAuthStore.getState().loadSession();
            check();
            refreshSession();
        };
        startSession();
        check();
        return () => offs.forEach((off) => off());
    }, []);

    return ready;
}
