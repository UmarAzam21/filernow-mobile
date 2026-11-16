// nativeApp\src\lib\api\errors.ts

import i18n from "@/i18n";

/** FastAPI validation errors come back as a list; everything else as a string. */
type ValidationIssue = { msg?: string; loc?: (string | number)[] };

/**
 * A failed API call. `status` is the HTTP status, or 0 when the server couldn't be reached
 * (offline, wrong API URL, timeout).
 */
export class ApiError extends Error {
    readonly status: number;
    readonly detail: unknown;

    constructor(status: number, detail: unknown, message?: string) {
        super(message ?? detailText(detail) ?? `Request failed (${status})`);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
    }

    get isNetwork() {
        return this.status === 0;
    }
}

function detailText(detail: unknown): string | null {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        const msgs = (detail as ValidationIssue[]).map((d) => d.msg).filter(Boolean);
        return msgs.length ? msgs.join("\n") : null;
    }
    return null;
}

/**
 * Text that is safe to show the user for any error thrown by an API call.
 * The backend's `detail` strings are written for users, so they're shown as-is when present.
 */
export function apiErrorMessage(error: unknown): string {
    const t = i18n.getFixedT(null, "common", "errors");
    if (!(error instanceof ApiError)) return t("generic");
    switch (error.status) {
        case 0:
            return t("network");
        case 401:
            return t("sessionExpired");
        case 429:
            return t("tooManyRequests");
        case 503:
            return t("maintenance");
        case 422:
            // validation lists are developer-facing; a plain string detail is fine to show
            return typeof error.detail === "string" ? error.detail : t("generic");
        default:
            return typeof error.detail === "string" && error.detail ? error.detail : t("generic");
    }
}
