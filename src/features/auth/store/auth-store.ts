// nativeApp\src\features\auth\store\auth-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
    phone: string | null; // 10 digits without 0/+92, e.g. "3001234567"
    signIn: (phone: string) => void;
    signOut: () => void;
};

// TODO: when FastAPI is connected, keep access/refresh tokens in expo-secure-store, not AsyncStorage.
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            phone: null,
            signIn: (phone) => set({ phone }),
            signOut: () => set({ phone: null }),
        }),
        {
            name: "filernow-auth",
            version: 1,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ phone: s.phone }),
        },
    ),
);