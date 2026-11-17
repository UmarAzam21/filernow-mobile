// nativeApp\src\features\auth\api\auth-api.ts

import { apiRequest } from "@/lib/api/client";

// Shapes follow the backend OpenAPI schemas (ExpenseManager*).

export type ApiAccount = {
    id: number;
    user_id: number;
    phone_number: string;
    business_name: string;
    email?: string | null;
    is_active: boolean;
    last_login_at?: string | null;
    created_at?: string | null;
};

export type ApiBusiness = {
    id: number;
    business_name: string;
    business_type: string;
    currency: string;
    created_at: string;
};

/** Returned by login, register, add business and switch business: a fresh token for the active business. */
export type TokenResponse = {
    access_token: string;
    token_type: string;
    account: ApiAccount;
    active_business_id: number | null;
    businesses: ApiBusiness[];
};

export type BusinessesResponse = { active_business_id: number; businesses: ApiBusiness[] };

/** Only phone + PIN are required; the backend names the first business "Personal" by default. */
export type RegisterRequest = {
    phone_number: string;
    pin: string;
    business_name?: string;
    business_type?: string;
    currency?: string;
    email?: string | null;
};

/** Get Started: is this number registered? Route on `next_step`. */
export type CheckPhoneResponse = { phone_number: string; registered: boolean; next_step: "login" | "set_pin" };

export type NewBusinessRequest = { business_name: string; business_type?: string; currency?: string };

/** The app keeps 10 digits ("3001234567"); the backend expects the local format ("03001234567"). */
export const toApiPhone = (digits: string) => `0${digits}`;

export const authApi = {
    /**
     * Rate-limited (10/min per IP → 429). 409 when the number belongs to a non-expense
     * (CMS) account; its `detail` is shown to the user.
     */
    checkPhone: (phone: string) =>
        apiRequest<CheckPhoneResponse>("/api/expenses/auth/check-phone", {
            method: "POST",
            auth: false,
            json: { phone_number: toApiPhone(phone) },
        }),

    login: (phone: string, pin: string) =>
        apiRequest<TokenResponse>("/api/expenses/auth/login", {
            method: "POST",
            auth: false,
            json: { phone_number: toApiPhone(phone), pin },
        }),

    register: (body: RegisterRequest) =>
        apiRequest<TokenResponse>("/api/expenses/auth/register", { method: "POST", auth: false, json: body }),

    /** `token` checks a stored token before it becomes the session (biometric login). */
    me: (token?: string) => apiRequest<ApiAccount>("/api/expenses/auth/me", { token }),

    /** Adds or replaces the account email. 409 if another account uses it, 422 if invalid. */
    linkEmail: (email: string) =>
        apiRequest<ApiAccount>("/api/expenses/auth/email", { method: "PUT", json: { email } }),

    businesses: (token?: string) => apiRequest<BusinessesResponse>("/api/expenses/auth/businesses", { token }),

    addBusiness: (body: NewBusinessRequest) =>
        apiRequest<TokenResponse>("/api/expenses/auth/businesses", { method: "POST", json: body }),

    switchBusiness: (businessId: number) =>
        apiRequest<TokenResponse>(`/api/expenses/auth/businesses/${businessId}/switch`, { method: "POST" }),

    changePin: (currentPin: string, newPin: string) =>
        apiRequest<void>("/api/expenses/auth/change-pin", {
            method: "POST",
            json: { current_pin: currentPin, new_pin: newPin },
            responseType: "none",
        }),
};
