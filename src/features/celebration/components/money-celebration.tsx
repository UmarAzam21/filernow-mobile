// nativeApp\src\features\celebration\components\money-celebration.tsx

import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Easing, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { BURST_SECONDS, createPieces } from "../lib/piece-motion";
import { useCelebrationStore } from "../store/celebration-store";
import { FallingPiece } from "./falling-piece";

/** Lets the dashboard finish sliding in before anything flies across it. */
const START_DELAY_MS = 350;
const BURST_MS = BURST_SECONDS * 1000;

function MoneyBurst({ onDone }: { onDone: () => void }) {
    const { width, height } = useWindowDimensions();
    const [pieces] = useState(() => createPieces(width, height));
    const clock = useSharedValue(0); // seconds since the first launch

    useEffect(() => {
        clock.set(withDelay(START_DELAY_MS, withTiming(BURST_SECONDS, { duration: BURST_MS, easing: Easing.linear })));
        const timer = setTimeout(onDone, START_DELAY_MS + BURST_MS);
        return () => clearTimeout(timer);
    }, [clock, onDone]);

    return (
        // pieces stack at the centre and move from there, so RTL layouts can't shift them
        <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[StyleSheet.absoluteFill, styles.centre]}
        >
            {pieces.map((piece) => (
                <FallingPiece key={piece.id} piece={piece} clock={clock} />
            ))}
        </View>
    );
}

/** One-off shower of money over the app after a new account is created. Never blocks touches. */
export function MoneyCelebration() {
    const pending = useCelebrationStore((s) => s.pending);
    const finish = useCelebrationStore((s) => s.finish);
    const reduceMotion = useReducedMotion();

    if (!pending || reduceMotion) return null;
    return <MoneyBurst onDone={finish} />;
}

const styles = StyleSheet.create({
    centre: { alignItems: "center", justifyContent: "center" },
});
