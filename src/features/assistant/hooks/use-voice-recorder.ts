// nativeApp\src\features\assistant\hooks\use-voice-recorder.ts

import {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";

/** HIGH_QUALITY records .m4a (accepted by the API); metering drives the orb while the user talks. */
const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

/** ~1 MB a minute at this bitrate; the API takes up to 5 MB, so stop well before that. */
export const MAX_RECORDING_MS = 60_000;

export type StartResult = "recording" | "denied" | "failed";

/** Microphone recording for one voice question. */
export function useVoiceRecorder() {
    const recorder = useAudioRecorder(OPTIONS);
    const state = useAudioRecorderState(recorder, 100);
    const active = useRef(false);

    const start = useCallback(async (): Promise<StartResult> => {
        try {
            const { granted } = await requestRecordingPermissionsAsync();
            if (!granted) return "denied";
            // iOS: route to the recorder; allowsRecording is ignored on Android
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await recorder.prepareToRecordAsync();
            recorder.record();
            active.current = true;
            return "recording";
        } catch {
            return "failed";
        }
    }, [recorder]);

    /** Stops and returns the file, or null if nothing was recorded. */
    const stop = useCallback(async (): Promise<string | null> => {
        if (!active.current) return null;
        active.current = false;
        try {
            await recorder.stop();
        } finally {
            // back to playback mode so replies come out of the speaker, not the earpiece
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
        }
        return recorder.uri;
    }, [recorder]);

    // never leave the mic on when the assistant closes mid-recording
    useEffect(
        () => () => {
            if (active.current) {
                active.current = false;
                recorder.stop().catch(() => {});
                setAudioModeAsync({ allowsRecording: false }).catch(() => {});
            }
        },
        [recorder],
    );

    return {
        start,
        stop,
        isRecording: state.isRecording,
        durationMs: state.durationMillis,
        /** 0..1 loudness, for the orb. */
        level: state.metering == null ? 0 : Math.min(1, Math.max(0, (state.metering + 60) / 60)),
    };
}
