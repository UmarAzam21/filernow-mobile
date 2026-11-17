// nativeApp\src\features\assistant\components\siri-orb.tsx

import { useId } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { type AssistantMotion, ORB_COLORS } from "../lib/assistant-motion";

type Blob = {
    color: string;
    offset: number;
    radius: number;
    spin: number;
    start: number;
};

/** Soft colour blobs that orbit the centre at different speeds/directions — the swirl inside the orb. */
const BLOBS: Blob[] = [
    { color: ORB_COLORS[0], offset: 0.2, radius: 0.46, spin: 1, start: 0 },
    { color: ORB_COLORS[2], offset: 0.24, radius: 0.42, spin: -1.35, start: 2.1 },
    { color: ORB_COLORS[3], offset: 0.22, radius: 0.4, spin: 0.75, start: 4.2 },
    { color: ORB_COLORS[4], offset: 0.26, radius: 0.3, spin: -0.55, start: 1.2 },
];

type Props = {
    size: number;
    motion: AssistantMotion;
    onPress?: () => void;
    accessibilityLabel?: string;
};

/** Glowing, swirling assistant orb (Siri-style). Breathes, and spins faster while it "thinks". */
export function SiriOrb({ size, motion, onPress, accessibilityLabel }: Props) {
    const { time, pulse, level } = motion;

    const breathe = useAnimatedStyle(() => {
        const t = time.get();
        // two mismatched waves feel organic rather than mechanical
        const wave = Math.sin(t * 3.1) * 0.65 + Math.sin(t * 7.3) * 0.35;
        // the user's voice swells the orb while recording
        return { transform: [{ scale: 1 + pulse.get() * wave + level.get() * 0.1 }] };
    });

    const halo = useAnimatedStyle(() => {
        const t = time.get();
        return {
            opacity: Math.min(1, 0.45 + pulse.get() * 3 + level.get() * 0.4 + Math.sin(t * 2) * 0.1),
            // peaks at ~1.1x so the glow stays within the orb's slot (1.6x the orb)
            transform: [{ scale: 0.95 + pulse.get() * 1.2 + level.get() * 0.1 + Math.sin(t * 2.4) * 0.03 }],
        };
    });

    const halo2 = size * 1.45;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            hitSlop={12}
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
            }}>
            {/* outer glow */}
            <Animated.View pointerEvents="none" style={[{ position: "absolute", width: halo2, height: halo2 }, halo]}>
                <SoftCircle size={halo2} color={ORB_COLORS[0]} innerOpacity={0.55} />
            </Animated.View>

            <Animated.View
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        overflow: "hidden",
                        backgroundColor: "#1A0610",
                    },
                    breathe,
                ]}>
                {BLOBS.map((blob, i) => (
                    <OrbBlob key={i} blob={blob} size={size} motion={motion} />
                ))}
                {/* glassy highlight + rim */}
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    <Highlight size={size} />
                </View>
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            borderRadius: size / 2,
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.35)",
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
}

function OrbBlob({ blob, size, motion }: { blob: Blob; size: number; motion: AssistantMotion }) {
    const { phase, time } = motion;
    const style = useAnimatedStyle(() => {
        const angle = blob.start + phase.get() * blob.spin;
        // blobs drift in and out a little as they orbit
        const wobble = 1 + Math.sin(time.get() * 1.7 + blob.start) * 0.12;
        return { transform: [{ rotate: `${angle}rad` }, { scale: wobble }] };
    });

    const r = size * blob.radius;
    const blobSize = r * 2;

    return (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
            <View
                style={{
                    position: "absolute",
                    width: blobSize,
                    height: blobSize,
                    left: size / 2 + size * blob.offset - r,
                    top: size / 2 - r,
                }}>
                <SoftCircle size={blobSize} color={blob.color} innerOpacity={1} />
            </View>
        </Animated.View>
    );
}

/** A circle that fades from `color` in the middle to transparent at the edge. */
function SoftCircle({ size, color, innerOpacity }: { size: number; color: string; innerOpacity: number }) {
    const id = `orb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    return (
        <Svg width={size} height={size}>
            <Defs>
                <RadialGradient id={id} cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={color} stopOpacity={innerOpacity} />
                    <Stop offset="0.55" stopColor={color} stopOpacity={innerOpacity * 0.55} />
                    <Stop offset="1" stopColor={color} stopOpacity={0} />
                </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
        </Svg>
    );
}

function Highlight({ size }: { size: number }) {
    const id = `hl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    return (
        <Svg width={size} height={size}>
            <Defs>
                <RadialGradient id={id} cx="35%" cy="25%" r="45%">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
        </Svg>
    );
}
