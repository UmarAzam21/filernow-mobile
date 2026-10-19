// nativeApp\src\stores\app-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LanguageCode } from "iso-639-1";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppState = {
    hasOnboarded: boolean;
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    completeOnboarding: () => void;
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            hasOnboarded: false,
            language: "en",
            setLanguage: (language) => set({ language }),
            completeOnboarding: () => set({ hasOnboarded: true }),
        }),
        {
            name: "filernow-app",
            version: 1,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ hasOnboarded: s.hasOnboarded, language: s.language }),
        },
    ),
);