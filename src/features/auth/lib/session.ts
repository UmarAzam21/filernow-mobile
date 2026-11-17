// nativeApp\src\features\auth\lib\session.ts

import { DEFAULT_BUSINESS_ID } from "@/features/business/data/business-options";
import { type NewBusiness, useBusinessStore } from "@/features/business/store/business-store";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { ApiError } from "@/lib/api/errors";
import { getBiometricPhone, getBiometricToken, setBiometricToken } from "@/storage/secure-session";

import { type ApiBusiness, type TokenResponse, authApi, toApiPhone } from "../api/auth-api";
import { useAuthStore } from "../store/auth-store";

/** Makes the server's businesses the app's, carrying the pre-backend local Khata data over once. */
function syncBusinesses(list: ApiBusiness[], activeId: number | null) {
    useBusinessStore.getState().syncFromServer(list, activeId);
    const target = useBusinessStore.getState().activeId;
    useKhataStore.getState().adoptBusinessData(DEFAULT_BUSINESS_ID, target);
}

/** Every token response (login, register, add/switch business) goes through here. */
async function applyTokenResponse(phone: string, res: TokenResponse) {
    await useAuthStore.getState().setSession({ phone, token: res.access_token, account: res.account });
    syncBusinesses(res.businesses, res.active_business_id);
    // keep the biometric copy fresh so the next fingerprint login gets a valid token
    if ((await getBiometricPhone()) === phone) await setBiometricToken(res.access_token);
}

/** PIN login. Resolves false for a wrong PIN / unknown number (the API doesn't say which); throws otherwise. */
export async function loginWithPin(phone: string, pin: string): Promise<boolean> {
    try {
        await applyTokenResponse(phone, await authApi.login(phone, pin));
        return true;
    } catch (e) {
        if (e instanceof ApiError && e.status === 401) return false;
        throw e;
    }
}

/** Creates the account (after Get Started said the number is new). */
export async function registerAccount(phone: string, pin: string) {
    // phone + PIN only: the backend creates the first business ("Personal"); email is linked later
    const res = await authApi.register({ phone_number: toApiPhone(phone), pin });
    await applyTokenResponse(phone, res);
}

/** Get Started: which screen a number goes to. Throws ApiError (429 rate limit, 409 CMS-owned number…). */
export async function nextStepFor(phone: string): Promise<"login" | "set_pin"> {
    const { next_step } = await authApi.checkPhone(phone);
    return next_step === "login" ? "login" : "set_pin";
}

/** Dashboard "Link email": saves it on the server and in the session, which hides the card. */
export async function linkEmail(email: string) {
    const account = await authApi.linkEmail(email.trim());
    useAuthStore.setState({ account });
}

/**
 * After a successful biometric prompt on the login screen: resume the server session with the
 * token kept for biometrics. Resolves false when there is none or it has expired (use the PIN).
 */
export async function restoreBiometricSession(phone: string): Promise<boolean> {
    const auth = useAuthStore.getState();
    if (auth.phone === phone && auth.token) return true; // App Lock: the session is still open

    const token = await getBiometricToken();
    if (!token) return false;
    try {
        const [account, businesses] = await Promise.all([authApi.me(token), authApi.businesses(token)]);
        await auth.setSession({ phone, token, account });
        syncBusinesses(businesses.businesses, businesses.active_business_id);
        return true;
    } catch (e) {
        if (e instanceof ApiError && e.status === 401) return false;
        throw e;
    }
}

/** On app start: confirm the stored token still works and pick up business changes. A 401 signs out. */
export async function refreshSession() {
    const { token } = useAuthStore.getState();
    if (!token) return;
    try {
        const [account, businesses] = await Promise.all([authApi.me(), authApi.businesses()]);
        useAuthStore.setState({ account });
        syncBusinesses(businesses.businesses, businesses.active_business_id);
    } catch {
        // offline: keep the cached session; a 401 has already signed out (api client)
    }
}

/** Switches the server-side active business; the new token scopes every later call to it. */
export async function switchBusiness(id: string) {
    const phone = useAuthStore.getState().phone;
    if (!phone) return;
    await applyTokenResponse(phone, await authApi.switchBusiness(Number(id)));
}

/** Creates a business on the server (it becomes active) and keeps its local-only theme colour. */
export async function addBusiness(business: NewBusiness) {
    const phone = useAuthStore.getState().phone;
    if (!phone) return;
    const res = await authApi.addBusiness({
        business_name: business.name,
        business_type: business.type,
        currency: business.currency,
    });
    await applyTokenResponse(phone, res);
    const store = useBusinessStore.getState();
    store.updateBusiness(store.activeId, { theme: business.theme });
}
