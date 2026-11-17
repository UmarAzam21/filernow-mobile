// nativeApp\src\features\assistant\lib\reply-player.ts

import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { File, Paths } from "expo-file-system";

let current: { player: AudioPlayer; file: File; done: () => void } | null = null;

function release() {
    if (!current) return;
    const { player, file, done } = current;
    current = null;
    player.remove();
    try {
        file.delete();
    } catch {
        // already gone
    }
    done();
}

/** Stops the reply that is playing, if any. */
export function stopReply() {
    release();
}

/**
 * Plays a reply MP3 that came base64 in the chat response. Resolves when playback ends (or is
 * stopped). Speech is a nice-to-have: the text is on screen, so failures resolve quietly.
 */
export async function playReply(base64: string | null | undefined): Promise<void> {
    stopReply();
    if (!base64) return;

    let file: File;
    try {
        file = new File(Paths.cache, `reply-${Date.now()}.mp3`);
        file.create({ overwrite: true });
        file.write(base64, { encoding: "base64" });
    } catch {
        return;
    }
    // after recording, make sure replies come out of the loudspeaker
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});

    return new Promise<void>((resolve) => {
        const player = createAudioPlayer({ uri: file.uri });
        current = { player, file, done: resolve };
        player.addListener("playbackStatusUpdate", (status) => {
            if (status.didJustFinish && current?.player === player) release();
        });
        player.play();
    });
}
