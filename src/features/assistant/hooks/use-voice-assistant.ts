// nativeApp\src\features\assistant\hooks\use-voice-assistant.ts

import { File } from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useKhataStore } from "@/features/khata/store/khata-store";
import { apiErrorMessage } from "@/lib/api/errors";
import { newId } from "@/lib/id";
import { useAppStore } from "@/stores/app-store";

import { type ChatInput, type DoneAction, type PendingAction, voiceApi } from "../api/voice-api";
import { playReply, stopReply } from "../lib/reply-player";
import { buildVoiceContext } from "../lib/voice-context";
import { MAX_RECORDING_MS, useVoiceRecorder } from "./use-voice-recorder";

/**
 * idle       nothing said yet
 * recording  mic is on
 * processing waiting for the assistant
 * ready      showing the conversation; tap the orb or type to continue
 */
export type VoicePhase = "idle" | "recording" | "processing" | "ready";

/** One exchange in the conversation, as shown on screen. */
export type ChatTurnView = {
    id: string;
    /** What the user said/typed (or "Confirm"/"Cancel"). null when we didn't get that far. */
    user: string | null;
    reply: string;
    /** Changes carried out this turn; failures are shown under the reply. */
    done: DoneAction[];
    /** Numbers and lists behind the reply (summaries, balances, entries), shown as tables. */
    data?: Record<string, unknown>[];
    error?: boolean;
};

const MIN_RECORDING_MS = 600;
/** Keep the screen to the latest few exchanges; the server has the full conversation. */
const MAX_TURNS = 6;

function deleteFile(uri: string) {
    try {
        new File(uri).delete();
    } catch {
        // already cleaned up
    }
}

/**
 * Siri-style conversation with /api/voice/chat. The server remembers the conversation, answers
 * questions, prepares changes and carries them out itself after a yes / Confirm; the app sends
 * each turn, shows and plays the reply, and refreshes Khata when something changed.
 */
export function useVoiceAssistant() {
    const { t } = useTranslation();
    const language = useAppStore((s) => s.language);
    const recorder = useVoiceRecorder();

    const [phase, setPhase] = useState<VoicePhase>("idle");
    const [turns, setTurns] = useState<ChatTurnView[]>([]);
    /** Changes waiting for Confirm / Cancel (or a spoken yes / no). */
    const [pending, setPending] = useState<PendingAction[]>([]);
    const [speaking, setSpeaking] = useState(false);
    const conversationId = useRef<string | null>(null);
    const startedAt = useRef(0);
    const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // the auto-stop timer must call the latest stopAndSend
    const stopRef = useRef<() => void>(() => {});

    useEffect(
        () => () => {
            stopReply();
            if (limitTimer.current) clearTimeout(limitTimer.current);
        },
        [],
    );

    const addTurn = (turn: Omit<ChatTurnView, "id">) =>
        setTurns((list) => [...list, { ...turn, id: newId() }].slice(-MAX_TURNS));

    const play = useCallback((base64: string | null | undefined) => {
        if (!base64) return;
        setSpeaking(true);
        playReply(base64).finally(() => setSpeaking(false));
    }, []);

    /** Sends one turn. `label` is shown as the user's line when the server has no transcript (buttons). */
    const send = async (input: Omit<ChatInput, "context" | "conversationId">, label?: string) => {
        stopReply();
        setPhase("processing");
        try {
            const res = await voiceApi.chat({
                ...input,
                conversationId: conversationId.current,
                context: buildVoiceContext(language),
            });
            conversationId.current = res.conversation_id;
            addTurn({
                user: res.transcript || label || null,
                reply: res.reply,
                done: res.done ?? [],
                data: res.data ?? [],
            });
            setPending(res.awaiting_confirmation ? (res.pending ?? []) : []);
            // something changed on the server: show it in Khata straight away
            if (res.done?.some((d) => d.ok)) useKhataStore.getState().sync();
            play(res.audio_base64);
        } catch (e) {
            addTurn({ user: input.text ?? label ?? null, reply: apiErrorMessage(e), done: [], error: true });
        } finally {
            setPhase("ready");
        }
    };

    const busy = phase === "processing";

    const startRecording = async () => {
        if (busy) return;
        stopReply();
        const started = await recorder.start();
        if (started !== "recording") {
            addTurn({
                user: null,
                reply: started === "denied" ? t("assistant.micDenied") : t("assistant.recordFailed"),
                done: [],
                error: true,
            });
            setPhase("ready");
            return;
        }
        setPhase("recording");
        startedAt.current = Date.now();
        // stop on our own before the file gets too big for the API
        limitTimer.current = setTimeout(() => stopRef.current(), MAX_RECORDING_MS);
    };

    const stopAndSend = async () => {
        if (limitTimer.current) clearTimeout(limitTimer.current);
        limitTimer.current = null;
        const duration = Date.now() - startedAt.current;
        const uri = await recorder.stop();
        if (!uri || duration < MIN_RECORDING_MS) {
            if (uri) deleteFile(uri);
            addTurn({
                user: null,
                reply: uri ? t("assistant.tooShort") : t("assistant.recordFailed"),
                done: [],
                error: !uri,
            });
            setPhase("ready");
            return;
        }
        try {
            await send({ audioUri: uri });
        } finally {
            deleteFile(uri);
        }
    };

    useEffect(() => {
        stopRef.current = stopAndSend;
    });

    const toggleRecording = () => (phase === "recording" ? stopAndSend() : startRecording());

    const ask = (text: string) => {
        const q = text.trim();
        if (!q || busy || phase === "recording") return;
        send({ text: q });
    };

    /** The Confirm / Cancel buttons for `pending`. */
    const respond = (confirm: boolean) => {
        if (busy || !pending.length) return;
        send({ confirm }, confirm ? t("assistant.pending.confirm") : t("assistant.pending.cancel"));
    };

    return {
        phase,
        turns,
        pending,
        speaking,
        busy,
        recordingMs: recorder.durationMs,
        level: recorder.level,
        toggleRecording,
        ask,
        respond,
    };
}
