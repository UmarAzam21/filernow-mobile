// nativeApp\src\features\assistant\components\assistant-overlay.tsx

import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useAssistantStore } from "../store/assistant-store";
import { AssistantPanel } from "./assistant-panel";

const OPEN_MS = 380;
const CLOSE_MS = 240;

/**
 * Siri-style "Ask AI" overlay shell: owns open/close and the enter/exit animation.
 * Mounted once in the tabs layout; opened from the tab bar's AI orb.
 * The panel (voice session, mic, audio) only exists while this is showing, so closing always
 * stops recording/playback and the next open starts a fresh conversation.
 */
export function AssistantOverlay() {
    const open = useAssistantStore((s) => s.open);
    const hide = useAssistantStore((s) => s.hide);
    const [mounted, setMounted] = useState(open);
    const progress = useSharedValue(0); // 0 hidden → 1 shown

    if (open && !mounted) setMounted(true);

    useEffect(() => {
        if (open) {
            progress.set(withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) }));
            return;
        }
        progress.set(
            withTiming(0, { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) }, (finished) => {
                if (finished) scheduleOnRN(setMounted, false);
            }),
        );
    }, [open, progress]);

    if (!mounted) return null;

    return (
        // edge to edge (under the status AND navigation bars) so the glow traces the real screen edge;
        // the panel's safe-area padding keeps the content clear of both bars
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={hide}>
            <AssistantPanel progress={progress} onClose={hide} />
        </Modal>
    );
}
