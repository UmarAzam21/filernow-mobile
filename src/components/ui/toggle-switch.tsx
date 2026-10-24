// nativeApp\src\components\ui\toggle-switch.tsx

import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { GradientFill, PRIMARY_GRADIENT } from "./gradient-fill";

const W = 54;
const H = 30;
const KNOB = 24;
const TRAVEL = W - KNOB - 6;

type Props = {
    value: boolean;
    onValueChange: (next: boolean) => void;
    accessibilityLabel: string;
};

/** Brand switch: red gradient track when on, grey when off, sliding white knob. */
export function ToggleSwitch({ value, onValueChange, accessibilityLabel }: Props) {
    const on = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        on.set(withTiming(value ? 1 : 0, { duration: 180 }));
    }, [value, on]);

    const fillStyle = useAnimatedStyle(() => ({ opacity: on.get() }));
    const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: on.get() * TRAVEL }] }));

    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={accessibilityLabel}
            hitSlop={8}>
            <View className="justify-center overflow-hidden rounded-full bg-[#DCD6D4]" style={{ width: W, height: H }}>
                <Animated.View style={[{ position: "absolute", inset: 0 }, fillStyle]}>
                    <GradientFill colors={PRIMARY_GRADIENT} direction="horizontal" />
                </Animated.View>
                <Animated.View
                    style={[
                        {
                            width: KNOB,
                            height: KNOB,
                            marginLeft: 3,
                            borderRadius: KNOB / 2,
                            backgroundColor: "#fff",
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 3,
                            shadowOffset: { width: 0, height: 1 },
                            elevation: 2,
                        },
                        knobStyle,
                    ]}
                />
            </View>
        </Pressable>
    );
}
