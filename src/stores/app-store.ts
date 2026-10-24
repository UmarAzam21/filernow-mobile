// nativeApp\src\stores\app-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LanguageCode } from "iso-639-1";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppState = {
    hasOnboarded: boolean;
    language: LanguageCode;
    /** Ask for the PIN when the app opens (toggled from the Quick Menu). */
    appLock: boolean;
    setLanguage: (code: LanguageCode) => void;
    completeOnboarding: () => void;
    setAppLock: (on: boolean) => void;
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            hasOnboarded: false,
            language: "en",
            appLock: true,
            setLanguage: (language) => set({ language }),
            completeOnboarding: () => set({ hasOnboarded: true }),
            setAppLock: (appLock) => set({ appLock }),
        }),
        {
            name: "filernow-app",
            version: 1,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ hasOnboarded: s.hasOnboarded, language: s.language, appLock: s.appLock }),
        },
    ),
);
