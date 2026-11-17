// nativeApp\src\features\celebration\store\celebration-store.ts

import { create } from "zustand";

type CelebrationState = {
    /** A burst is waiting to play (or playing). Not persisted: it should never replay on app start. */
    pending: boolean;
    play: () => void;
    finish: () => void;
};

export const useCelebrationStore = create<CelebrationState>((set) => ({
    pending: false,
    play: () => set({ pending: true }),
    finish: () => set({ pending: false }),
}));
