// nativeApp\src\lib\api\config.ts

/**
 * Backend base URL, from EXPO_PUBLIC_API_URL (.env.local in development, EAS env vars in builds).
 * In development it must be the PC's LAN IP (e.g. http://192.168.1.23:8000), not localhost.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Default request timeout. Voice calls pass a longer one (speech + AI can take a while). */
export const DEFAULT_TIMEOUT_MS = 20_000;
