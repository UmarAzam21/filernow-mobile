// nativeApp\src\features\assistant\store\assistant-store.ts

import { create } from "zustand";

type AssistantState = {
    /** The Siri-style "Ask AI" overlay is showing. Not persisted. */
    open: boolean;
    show: () => void;
    hide: () => void;
};

export const useAssistantStore = create<AssistantState>((set) => ({
    open: false,
    show: () => set({ open: true }),
    hide: () => set({ open: false }),
}));
