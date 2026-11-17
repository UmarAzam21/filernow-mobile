// nativeApp\src\features\assistant\lib\assistant-motion.ts

import { useEffect } from "react";
import {
    type SharedValue,
    useFrameCallback,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export type AssistantMode = "idle" | "listening" | "thinking" | "speaking" | "answered";

/** Siri-like palette, anchored on the brand red/coral. */
export const ORB_COLORS = ["#FF5C70", "#C8102E", "#A855F7", "#3B82F6", "#F59E0B"] as const;

/** How "alive" each mode looks: spin speed (rad/s) and pulse amplitude. */
const MODE_ENERGY: Record<AssistantMode, { speed: number; pulse: number }> = {
    idle: { speed: 0.9, pulse: 0.04 },
    listening: { speed: 1.8, pulse: 0.12 },
    thinking: { speed: 4.2, pulse: 0.06 },
    speaking: { speed: 1.4, pulse: 0.09 },
    answered: { speed: 0.7, pulse: 0.03 },
};

export type AssistantMotion = {
    /** Phase that keeps advancing; its rate eases between modes so the orb never jumps. */
    phase: SharedValue<number>;
    /** Wall-clock seconds, for steady breathing. */
    time: SharedValue<number>;
    /** Pulse amplitude for the current mode (animated). */
    pulse: SharedValue<number>;
    /** Live microphone loudness 0..1 (smoothed); the orb swells with the voice. */
    level: SharedValue<number>;
};

/** One shared clock for the orb and the screen-edge glow. Frozen when the OS asks for reduced motion. */
export function useAssistantMotion(mode: AssistantMode, running: boolean, voiceLevel = 0): AssistantMotion {
    const reduceMotion = useReducedMotion();
    const phase = useSharedValue(0);
    const time = useSharedValue(0);
    const speed = useSharedValue(MODE_ENERGY.idle.speed);
    const pulse = useSharedValue(MODE_ENERGY.idle.pulse);
    const level = useSharedValue(0);

    const frame = useFrameCallback((info) => {
        const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
        phase.set(phase.get() + dt * speed.get());
        time.set(time.get() + dt);
    }, false);

    useEffect(() => {
        frame.setActive(running && !reduceMotion);
    }, [frame, running, reduceMotion]);

    useEffect(() => {
        const energy = MODE_ENERGY[mode];
        speed.set(withTiming(energy.speed, { duration: 600 }));
        pulse.set(withTiming(energy.pulse, { duration: 400 }));
    }, [mode, speed, pulse]);

    useEffect(() => {
        level.set(withTiming(mode === "listening" ? voiceLevel : 0, { duration: 120 }));
    }, [mode, voiceLevel, level]);

    return { phase, time, pulse, level };
}
