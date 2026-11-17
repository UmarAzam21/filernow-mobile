// nativeApp\src\features\assistant\lib\voice-context.ts

import { getCalendars } from "expo-localization";

import type { AppLanguage } from "@/i18n/languages";

import type { ReplyLanguage, VoiceContext } from "../api/voice-api";

/** Urdu and Roman Urdu speakers get Urdu transcription hints and Urdu replies. */
export const replyLanguageFor = (lang: AppLanguage): ReplyLanguage => (lang === "en" ? "en" : "ur");

/** Only what the phone knows. The server loads the user's categories, cards and currency itself. */
export const buildVoiceContext = (language: AppLanguage): VoiceContext => ({
    timezone: getCalendars()[0]?.timeZone ?? "Asia/Karachi",
    language_hint: replyLanguageFor(language),
});
