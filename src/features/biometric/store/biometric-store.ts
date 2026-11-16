// nativeApp\src\features\biometric\store\biometric-store.ts

import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { clearBiometricPhone, getBiometricPhone, setBiometricPhone, setBiometricToken } from "@/storage/secure-session";

import i18n from "@/i18n";

import {
    authenticate,
    getBiometricSupport,
    methodLabel,
    type BiometricResult,
    type BiometricSupport,
} from "../lib/biometric-service";

type BiometricState = {
    /** null until the device has been checked. */
    support: BiometricSupport | null;
    /** Account with biometric login turned on; mirrors secure storage. */
    enrolledPhone: string | null;
    load: () => Promise<void>;
    /** Re-checks the device, e.g. after the user added a fingerprint in phone settings. */
    refreshSupport: () => Promise<void>;
    /** Confirms with a biometric scan, then turns biometric login on for `phone`. */
    enable: (phone: string) => Promise<BiometricResult>;
    disable: () => Promise<void>;
};

let loading: Promise<void> | null = null;

// Not persisted through zustand: secure storage is the source of truth, this store keeps
// every screen (login, Settings, App Lock sheet) in sync without re-reading it.
export const useBiometricStore = create<BiometricState>()((set, get) => ({
    support: null,
    enrolledPhone: null,

    load: () => {
        loading ??= Promise.all([getBiometricSupport(), getBiometricPhone()]).then(([support, enrolledPhone]) =>
            set({ support, enrolledPhone }),
        );
        return loading;
    },

    refreshSupport: async () => {
        await get().load();
        set({ support: await getBiometricSupport() });
    },

    enable: async (phone) => {
        await get().load();
        const support = get().support;
        if (!support?.available) {
            const reason = support?.unavailableReason ?? "notEnrolled";
            return { success: false, cancelled: false, message: i18n.t(`auth:biometric.unavailable.${reason}`) };
        }

        const result = await authenticate(i18n.t("auth:biometric.enablePrompt", { method: methodLabel(support.method) }));
        if (!result.success) return result;

        try {
            await setBiometricPhone(phone);
            // the token a later biometric login resumes with (see auth/lib/session)
            const token = useAuthStore.getState().token;
            if (token) await setBiometricToken(token);
        } catch {
            return { success: false, cancelled: false, message: i18n.t("auth:biometric.error.saveFailed") };
        }
        set({ enrolledPhone: phone });
        return result;
    },

    disable: async () => {
        await clearBiometricPhone();
        set({ enrolledPhone: null });
    },
}));
