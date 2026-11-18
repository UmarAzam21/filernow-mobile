// nativeApp\src\features\auth\components\pin-screen-layout.tsx

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { flipInRTL } from "@/i18n/direction";
import { colors } from "@/theme/tokens";

// Same pre-rendered 3D art as the register screen, so both auth screens share one look
const art = {
  glowPink: require("@/assets/images/register/glow-pink.png"),
  glowLilac: require("@/assets/images/register/glow-lilac-strong.png"),
  badge: require("@/assets/images/register/logo-badge.png"), // rings + raised white disc (disc ~49% of the image)
  lock: require("@/assets/images/pin/lock-3d.png"), // 800 x 928, transparent
} as const;
const BADGE = 206; // white disc ~101pt, outer glow ring ~145pt
const LOCK_W = 58;
const LOCK_H = Math.round(LOCK_W * (928 / 800));

type Props = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  /** Shown above the lock badge, e.g. step progress. */
  top?: ReactNode;
  /** Shown under the heading: phone chip, dots, links. */
  children: ReactNode;
  /** Content of the white bottom sheet. */
  keypad: ReactNode;
};

/** Shared shell for the PIN screens: soft glow background, back button, 3D lock badge, heading and keypad sheet. */
export function PinScreenLayout({ title, subtitle, onBack, top, children, keypad }: Props) {
  const { t } = useTranslation("auth");
  const insets = useSafeAreaInsets();
  const compact = useWindowDimensions().height < 700;
  const [reveal] = useState(() => new Animated.Value(0));

  // replay the entrance whenever the heading changes (create -> confirm)
  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [title, reveal]);

  const badge = compact ? Math.round(BADGE * 0.72) : BADGE;
  const lockScale = badge / BADGE;

  return (
    <View className="flex-1 bg-page-bg">
      <StatusBar style="dark" />

      {/* Soft pink glow top-left, lilac glow on the right */}
      <View pointerEvents="none" style={{ position: "absolute", left: -110, top: -60, width: 360, height: 360 }}>
        <Image source={art.glowPink} contentFit="fill" style={{ width: 360, height: 360 }} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", right: -120, top: 160, width: 330, height: 330 }}>
        <Image source={art.glowLilac} contentFit="fill" style={{ width: 330, height: 330 }} />
      </View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          {top}

          {/* Raised white disc with rings + the glossy 3D lock */}
          <View
            pointerEvents="none"
            accessible={false}
            style={{ width: badge, height: badge, marginVertical: -badge * 0.22, alignItems: "center", justifyContent: "center" }}
          >
            <Image source={art.badge} contentFit="fill" style={{ position: "absolute", width: badge, height: badge }} />
            <Image
              source={art.lock}
              contentFit="contain"
              style={{ width: LOCK_W * lockScale, height: LOCK_H * lockScale, marginTop: -4 * lockScale }}
            />
          </View>

          <Animated.View
            style={{
              alignItems: "center",
              marginTop: compact ? 8 : 14,
              opacity: reveal,
              transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              className="text-center font-jakarta-extrabold text-text-dark"
              style={{ fontSize: 29, lineHeight: 36, letterSpacing: -1 }}
            >
              {title}
            </Text>
            <Text className="mt-1.5 text-center font-jakarta text-[15px] leading-[22px] text-text-secondary-muted">
              {subtitle}
            </Text>
          </Animated.View>

          {children}
        </View>

        {/* Back button: raised white square, top-left (drawn last so it sits above the badge) */}
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={t("pin.back")}
            hitSlop={6}
            // absolute children ignore the safe-area padding, so add the status bar height ourselves
            style={{ top: insets.top + 12 }}
            className="absolute left-5 h-11 w-11 items-center justify-center rounded-[14px] border-b-[3px] border-[#e6dfdc] bg-white shadow-md shadow-black/10 active:opacity-80"
          >
            <ArrowLeft size={20} color={colors["text-dark"]} strokeWidth={2.2} style={flipInRTL} />
          </Pressable>
        )}

        <View
          className="rounded-t-[32px] border border-b-0 border-border-clr/65 bg-white px-5 pt-2.5 shadow-xl shadow-primary-deep/10"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-clr" />
          {keypad}
        </View>
      </SafeAreaView>
    </View>
  );
}
