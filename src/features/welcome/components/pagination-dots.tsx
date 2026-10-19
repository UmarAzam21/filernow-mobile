// nativeApp\src\features\welcome\components\pagination-dots.tsx

import { Animated, View } from "react-native";

import { colors } from "@/theme/tokens";

type Props = { count: number; scrollX: Animated.Value; width: number };

export function PaginationDots({ count, scrollX, width }: Props) {
    return (
        <View className="mb-[18px] flex-row justify-center gap-1.5">
            {Array.from({ length: count }, (_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                return (
                    <Animated.View
                        key={i}
                        style={{
                            width: scrollX.interpolate({ inputRange, outputRange: [8, 22, 8], extrapolate: "clamp" }),
                            opacity: scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: "clamp" }),
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                        }}
                    />
                );
            })}
        </View>
    );
}