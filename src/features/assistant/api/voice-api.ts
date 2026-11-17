// nativeApp\src\features\assistant\api\voice-api.ts

import { File } from "expo-file-system";

import { apiRequest } from "@/lib/api/client";

// POST /api/voice/chat: the conversational assistant (backend OpenAPI: ChatResponse, PendingAction,
// DoneAction). The server keeps the conversation, answers questions from the user's real data,
// prepares changes (several entries, edits, deletes, categories, cards, transfers) and carries them
// out itself once the user says yes or taps Confirm. Every reply comes with its MP3.

export type ReplyLanguage = "en" | "ur";

/** Only what the phone knows; the server reads categories, cards and currency itself. */
export type VoiceContext = {
    language_hint?: ReplyLanguage | null;
    timezone?: string;
    today?: string; // YYYY-MM-DD
};

export type PendingKind = "add_entry" | "update_entry" | "delete_entry" | "create_category" | "add_card" | "transfer";

/** A change waiting for the user's yes. `description` is ready to show. */
export type PendingAction = { kind: PendingKind | string; description: string; params: Record<string, unknown> };

/** A change carried out (or that failed) this turn. */
export type DoneAction = { kind: string; description: string; ok: boolean; id?: number | null; error?: string | null };

export type ChatTurn = {
    /** Send back with the next request. A new one comes back after 30 idle minutes. */
    conversation_id: string;
    /** What the user said or typed. */
    transcript: string;
    reply: string;
    reply_language: ReplyLanguage;
    /** MP3 of `reply`, base64. */
    audio_base64?: string | null;
    audio_mime?: string;
    awaiting_confirmation: boolean;
    pending: PendingAction[];
    done: DoneAction[];
    /** Numbers and lists looked up this turn (summaries, balances, entries). */
    data: Record<string, unknown>[];
};

export type ChatInput = {
    /** A recording, or… */
    audioUri?: string;
    /** …a typed message, or… */
    text?: string;
    /** …the Confirm (true) / Cancel (false) button for `pending`. */
    confirm?: boolean;
    conversationId?: string | null;
    context: VoiceContext;
};

const VOICE_TIMEOUT_MS = 60_000;

/**
 * In this SDK the global fetch is expo/fetch, whose FormData does NOT support React Native's
 * `{ uri, name, type }` objects (it throws before sending). An expo-file-system File works: it's
 * read via `bytes()`, and its `name` keeps the real extension (".m4a"), which the server checks.
 */
const audioPart = (uri: string) => new File(uri) as unknown as Blob;

export const voiceApi = {
    /** One turn of the conversation. Nothing changes on the server until a confirm. */
    chat: (input: ChatInput) => {
        const form = new FormData();
        if (input.audioUri) form.append("audio", audioPart(input.audioUri));
        if (input.text) form.append("text", input.text);
        if (input.confirm !== undefined) form.append("confirm", String(input.confirm));
        if (input.conversationId) form.append("conversation_id", input.conversationId);
        form.append("context", JSON.stringify(input.context));
        form.append("speak", "true");
        return apiRequest<ChatTurn>("/api/voice/chat", {
            method: "POST",
            multipart: form,
            timeoutMs: VOICE_TIMEOUT_MS,
        });
    },
};
