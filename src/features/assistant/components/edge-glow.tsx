// nativeApp\src\features\assistant\components\edge-glow.tsx

import { useId, useState } from "react";
import { type LayoutChangeEvent, Platform, StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { type AssistantMotion, ORB_COLORS } from "../lib/assistant-motion";

/** Roughly matches modern phone screen corners so the glow follows the rounded display edge. */
const CORNER = Platform.OS === "ios" ? 50 : 34;

/**
 * Stacked strokes fake a blurred neon edge without native blur: a bright thin line on the edge
 * and wider, fainter bands bleeding inwards. Every stroke sits fully INSIDE the screen
 * (a stroke centred on the edge would lose half of itself off-screen).
 */
const BAND_COUNT = 12; // more, fainter bands = a smoother fade (no visible steps)
const BAND_STEP = 2; // px each band reaches further inwards → the glow reaches BAND_COUNT × BAND_STEP = 24px
const BAND_OPACITY = 0.05; // overlapping bands add up: brightest at the edge, fading evenly inwards

const STROKES = [
    // soft falloff: widest band first so the thinner, brighter ones sit on top.
    // A stroke of width w is inset by w/2 (see below), so it covers exactly w px in from the edge.
    ...Array.from({ length: BAND_COUNT }, (_, i) => ({
        width: (BAND_COUNT - i) * BAND_STEP,
        opacity: BAND_OPACITY,
    })),
    // crisp light line right on the edge, drawn last so nothing dulls it
    { width: 2, opacity: 0.6 },
];

/** Overall ceiling for the glow, so it stays a soft light rather than a solid band. */
const MAX_OPACITY = 0.8;

/** Gradient directions we cross-fade between, so the colours appear to travel around the edge. */
const LAYERS = [
    { x1: 0, y1: 0, x2: 1, y2: 1, colors: [ORB_COLORS[0], ORB_COLORS[2], ORB_COLORS[3], ORB_COLORS[4]] },
    { x1: 1, y1: 0, x2: 0, y2: 1, colors: [ORB_COLORS[3], ORB_COLORS[0], ORB_COLORS[4], ORB_COLORS[2]] },
    { x1: 0, y1: 1, x2: 1, y2: 0, colors: [ORB_COLORS[4], ORB_COLORS[3], ORB_COLORS[2], ORB_COLORS[0]] },
];

type Props = { motion: AssistantMotion; progress: SharedValue<number> };
type Size = { width: number; height: number };

/** Siri-style glowing rainbow border around the whole screen. Never takes touches. */
export function EdgeGlow({ motion, progress }: Props) {
    // the overlay's real size (on Android the window size can differ from what the modal covers)
    const [size, setSize] = useState<Size | null>(null);
    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) => (s && s.width === width && s.height === height ? s : { width, height }));
    };

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
            {size
                ? LAYERS.map((layer, i) => (
                      <GlowLayer key={i} index={i} layer={layer} size={size} motion={motion} progress={progress} />
                  ))
                : null}
        </View>
    );
}

function GlowLayer({
    index,
    layer,
    size,
    motion,
    progress,
}: Props & { index: number; layer: (typeof LAYERS)[number]; size: Size }) {
    const id = `edge${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const { phase, time, pulse } = motion;
    const count = LAYERS.length;

    const style = useAnimatedStyle(() => {
        // each layer peaks in turn as the phase advances; (1 + cos) / 2 rises and falls without
        // the hard on/off of a clipped cosine, and the slower rate makes colour changes glide
        const p = phase.get() * 0.35 - (index * Math.PI * 2) / count;
        const weight = ((1 + Math.cos(p)) / 2) ** 2;
        const breathe = 0.75 + Math.sin(time.get() * 1.4) * 0.08 + pulse.get() * 1.2;
        // the first layer never fades out completely, so the edge is always lit
        const base = index === 0 ? 0.35 : 0;
        return { opacity: progress.get() * Math.min(MAX_OPACITY, base + weight * breathe) };
    });

    const { width, height } = size;

    return (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id={id} x1={layer.x1} y1={layer.y1} x2={layer.x2} y2={layer.y2}>
                        {layer.colors.map((c, i) => (
                            <Stop key={i} offset={i / (layer.colors.length - 1)} stopColor={c} />
                        ))}
                    </LinearGradient>
                </Defs>
                {STROKES.map((s, i) => {
                    // inset by half the stroke so its outer edge touches the screen edge
                    const inset = s.width / 2;
                    const radius = Math.max(0, CORNER - inset);
                    return (
                        <Rect
                            key={i}
                            x={inset}
                            y={inset}
                            width={width - s.width}
                            height={height - s.width}
                            rx={radius}
                            ry={radius}
                            fill="none"
                            stroke={`url(#${id})`}
                            strokeWidth={s.width}
                            strokeOpacity={s.opacity}
                        />
                    );
                })}
            </Svg>
        </Animated.View>
    );
}
