// nativeApp\src\features\auth\store\auth-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { configureApi } from "@/lib/api/client";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/storage/secure-session";

import type { ApiAccount } from "../api/auth-api";

type AuthState = {
    phone: string | null; // 10 digits without 0/+92, e.g. "3001234567"
    account: ApiAccount | null;
    /** Bearer token. Kept in memory + secure storage only, never in AsyncStorage. */
    token: string | null;
    /** The token has been read from secure storage (startup). */
    sessionLoaded: boolean;
    /** Stores a new session (login, register, business add/switch). */
    setSession: (session: { phone: string; token: string; account?: ApiAccount }) => Promise<void>;
    loadSession: () => Promise<void>;
    signOut: () => void;
};

let loading: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            phone: null,
            account: null,
            token: null,
            sessionLoaded: false,

            setSession: async ({ phone, token, account }) => {
                await setSessionToken(token);
                set((s) => ({ phone, token, account: account ?? s.account }));
            },

            loadSession: () => {
                loading ??= getSessionToken().then((token) => {
                    // signed in before the backend existed (no token): start over from login
                    if (get().phone && !token) set({ phone: null, account: null });
                    set({ token, sessionLoaded: true });
                });
                return loading;
            },

            signOut: () => {
                clearSessionToken();
                set({ phone: null, account: null, token: null });
            },
        }),
        {
            name: "filernow-auth",
            version: 2,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ phone: s.phone, account: s.account }),
            migrate: (persisted) => ({ account: null, ...(persisted as object) }) as AuthState,
        },
    ),
);

export const useIsSignedIn = () => useAuthStore((s) => s.phone !== null && s.token !== null);

// Every API call reads the current token; an expired one signs the user out (the tabs layout
// then redirects to Welcome).
configureApi({
    getToken: () => useAuthStore.getState().token,
    onUnauthorized: () => useAuthStore.getState().signOut(),
});
