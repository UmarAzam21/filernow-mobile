// nativeApp\src\storage\secure-session.ts

import * as SecureStore from "expo-secure-store";

// Keychain (iOS) / Keystore-encrypted prefs (Android). Never synced to iCloud or other devices.
const OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** The account (10-digit phone) that may log in with biometrics on this device. One per device. */
const BIOMETRIC_PHONE_KEY = "filernow.biometric.phone";

/** Access token of the signed-in session. Cleared on logout. */
const SESSION_TOKEN_KEY = "filernow.session.token";

/**
 * Copy of the access token for the biometric account. Survives logout and is only read after a
 * successful biometric prompt, so biometric login gets a real server session.
 */
const BIOMETRIC_TOKEN_KEY = "filernow.biometric.token";

async function read(key: string) {
    try {
        return await SecureStore.getItemAsync(key, OPTIONS);
    } catch {
        // unavailable (web) or the keystore entry was invalidated, e.g. after a device restore
        return null;
    }
}

async function remove(key: string) {
    try {
        await SecureStore.deleteItemAsync(key, OPTIONS);
    } catch {
        // nothing stored
    }
}

export const getSessionToken = () => read(SESSION_TOKEN_KEY);
export const setSessionToken = (token: string) => SecureStore.setItemAsync(SESSION_TOKEN_KEY, token, OPTIONS);
export const clearSessionToken = () => remove(SESSION_TOKEN_KEY);

export const getBiometricToken = () => read(BIOMETRIC_TOKEN_KEY);
export const setBiometricToken = (token: string) => SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token, OPTIONS);
export const clearBiometricToken = () => remove(BIOMETRIC_TOKEN_KEY);

export async function getBiometricPhone() {
    try {
        return await SecureStore.getItemAsync(BIOMETRIC_PHONE_KEY, OPTIONS);
    } catch {
        // unavailable (web) or the keystore entry was invalidated, e.g. after a device restore
        return null;
    }
}

export async function setBiometricPhone(phone: string) {
    await SecureStore.setItemAsync(BIOMETRIC_PHONE_KEY, phone, OPTIONS);
}

export async function clearBiometricPhone() {
    await remove(BIOMETRIC_PHONE_KEY);
    await remove(BIOMETRIC_TOKEN_KEY);
}
