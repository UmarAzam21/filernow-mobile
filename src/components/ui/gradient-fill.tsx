// nativeApp\src\components\ui\gradient-fill.tsx

import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/** Brand red gradient used by primary CTAs (light coral → deep red). */
export const PRIMARY_GRADIENT = ["#FF5C70", "#D4123A"] as const;

type Props = {
    colors: readonly [string, string];
    direction?: "horizontal" | "diagonal";
};

/**
 * Paints a linear gradient behind its parent's content.
 * Put it first inside a View with `overflow-hidden` + a border radius so the corners clip.
 */
export function GradientFill({ colors: [from, to], direction = "diagonal" }: Props) {
    // useId returns ":r0:"-style ids; SVG url(#…) refs need plain characters.
    const id = `grad${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
                <LinearGradient id={id} x1="0" y1="0" x2="1" y2={direction === "horizontal" ? "0" : "1"}>
                    <Stop offset="0" stopColor={from} />
                    <Stop offset="1" stopColor={to} />
                </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
    );
}
