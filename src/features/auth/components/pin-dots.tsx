// nativeApp\src\features\auth\components\pin-dots.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

const DOT = 16;
const EMPTY = "#D9D4D5";
const ERROR = "#EF4444";

/** One PIN dot: grey ring when empty, red ring for the next digit, solid red when filled. */
function PinDot({ filled, current, error }: { filled: boolean; current: boolean; error: boolean }) {
  const [scale] = useState(() => new Animated.Value(filled ? 1 : 0));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: filled ? 1 : 0,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [filled, scale]);

  const ring = error ? ERROR : filled || current ? colors.primary : EMPTY;
  return (
    <View
      style={{
        width: DOT,
        height: DOT,
        borderRadius: DOT / 2,
        borderWidth: 2,
        borderColor: ring,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* fill pops in and covers the ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
          backgroundColor: error ? ERROR : colors.primary,
          opacity: scale,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}

type Props = {
  length: number;
  filled: number;
  error: string | null;
  shake: Animated.Value;
  loading?: boolean;
  success?: string | null;
};

/** PIN progress dots with the status line underneath (error, loading or success). */
export function PinDots({ length, filled, error, shake, loading, success }: Props) {
  const { t } = useTranslation("auth");
  return (
    <View className="mt-7 items-center">
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <View className="flex-row gap-[23px]" accessibilityLabel={t("pin.digitsEntered", { filled, length })}>
          {Array.from({ length }).map((_, index) => (
            <PinDot key={index} filled={index < filled} current={index === filled} error={!!error} />
          ))}
        </View>
      </Animated.View>

      <View className="mt-3 h-6 items-center justify-center">
        {error ? (
          <Text className="text-center font-jakarta-medium text-[13px] text-red-500">{error}</Text>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : success ? (
          <Text className="text-center font-jakarta-bold text-[13px] text-emerald-600">{success}</Text>
        ) : null}
      </View>
    </View>
  );
}
