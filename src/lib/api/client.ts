// nativeApp\src\lib\api\client.ts

import { API_URL, DEFAULT_TIMEOUT_MS } from "./config";
import { ApiError } from "./errors";

type FormValue = string | number | null | undefined;

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    /** Sent as application/json. */
    json?: unknown;
    /** Sent as application/x-www-form-urlencoded (null/undefined fields are left out). */
    form?: Record<string, FormValue>;
    /** Sent as multipart/form-data (fetch adds the boundary). */
    multipart?: FormData;
    query?: Record<string, FormValue | boolean>;
    /** Attach the Bearer token (default true). Login/register pass false. */
    auth?: boolean;
    /** Override the token, e.g. to validate a stored one before it becomes the session. */
    token?: string;
    timeoutMs?: number;
    /** "json" (default), "none" for 204s, or "raw" to get the Response (e.g. audio). */
    responseType?: "json" | "none" | "raw";
    /** Alternative fetch, e.g. expo/fetch for binary downloads. */
    fetcher?: (url: string, init: RequestInit) => Promise<Response>;
};

type ApiHooks = {
    getToken: () => string | null;
    /** Called when an authenticated request returns 401 (expired or revoked token). */
    onUnauthorized: () => void;
};

// Set once by the auth store, so this module doesn't import feature code.
let hooks: ApiHooks = { getToken: () => null, onUnauthorized: () => {} };

export function configureApi(next: ApiHooks) {
    hooks = next;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
    if (!API_URL) throw new ApiError(0, null, "EXPO_PUBLIC_API_URL is not set");
    const params = Object.entries(query ?? {})
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return `${API_URL}${path}${params.length ? `?${params.join("&")}` : ""}`;
}

function encodeForm(form: Record<string, FormValue>) {
    return Object.entries(form)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
}

async function readDetail(res: Response): Promise<unknown> {
    try {
        const body = await res.json();
        return body?.detail ?? body;
    } catch {
        return null;
    }
}

/** One place for every backend call: base URL, auth header, body encoding, timeout and errors. */
export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", json, form, multipart, query, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

    const headers: Record<string, string> = { Accept: "application/json" };
    let body: BodyInit | undefined;
    if (json !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(json);
    } else if (form) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        body = encodeForm(form);
    } else if (multipart) {
        body = multipart; // no Content-Type: fetch sets it with the boundary
    }

    const token = options.token ?? (auth ? hooks.getToken() : null);
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
        const doFetch = options.fetcher ?? fetch;
        res = await doFetch(buildUrl(path, query), { method, headers, body, signal: controller.signal });
    } catch (e) {
        if (e instanceof ApiError) throw e;
        // users see a generic "can't reach the server"; keep the real reason visible while developing
        if (__DEV__) console.warn(`[api] ${method} ${path} failed before a response:`, e);
        throw new ApiError(0, null, e instanceof Error ? e.message : "Network request failed");
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok) {
        const detail = await readDetail(res);
        // only an authenticated session can "expire"; a wrong PIN on login is also a 401
        if (res.status === 401 && token && !options.token) hooks.onUnauthorized();
        throw new ApiError(res.status, detail);
    }

    const responseType = options.responseType ?? "json";
    if (responseType === "raw") return res as T;
    if (responseType === "none" || res.status === 204) return undefined as T;
    return (await res.json()) as T;
}
