// nativeApp\src\features\language\screens\language-screen.tsx

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageHero } from "@/features/language/components/language-hero";
import { LanguagePicker } from "@/features/language/components/language-picker";
import { switchLanguage } from "@/features/language/lib/switch-language";
import { flipInRTL, needsDirectionChange } from "@/i18n/direction";
import type { AppLanguage } from "@/i18n/languages";
import { useAppStore } from "@/stores/app-store";
import { colors } from "@/theme/tokens";

// Same soft glows as the register / PIN screens, so onboarding reads as one flow
const glow = {
    pink: require("@/assets/images/register/glow-pink.png"),
    lilac: require("@/assets/images/register/glow-lilac-strong.png"),
} as const;

/** Onboarding: pick the app language, then continue to the phone number screen. */
export default function LanguageScreen() {
    const router = useRouter();
    const { t } = useTranslation(["language", "common"]);

    const storedLanguage = useAppStore((s) => s.language);
    const completeOnboarding = useAppStore((s) => s.completeOnboarding);
    const [selectedCode, setSelectedCode] = useState<AppLanguage>(storedLanguage);
    const [saving, setSaving] = useState(false);
    // first launch has nothing behind this screen, so only show back when it leads somewhere
    const [canGoBack] = useState(() => router.canGoBack());

    const onContinue = async () => {
        setSaving(true);
        completeOnboarding();
        // Urdu ↔ LTR restarts the app; the launch route then sends an onboarded user to /register
        const restarts = needsDirectionChange(selectedCode);
        await switchLanguage(selectedCode);
        if (!restarts) router.replace("/register");
    };

    return (
        <View className="flex-1 bg-page-bg">
            <StatusBar style="dark" />

            {/* soft pink glow top-left, lilac glow on the right */}
            <View pointerEvents="none" style={{ position: "absolute", left: -70, top: -40, width: 380, height: 380 }}>
                <Image source={glow.pink} contentFit="fill" style={{ width: 380, height: 380 }} />
            </View>
            <View pointerEvents="none" style={{ position: "absolute", right: -130, top: 150, width: 340, height: 340 }}>
                <Image source={glow.lilac} contentFit="fill" style={{ width: 340, height: 340 }} />
            </View>

            <SafeAreaView edges={["top", "bottom"]} className="flex-1 px-5">
                {/* top row: back button left, globe right. In the layout flow so the title always starts below them */}
                <View className="flex-row items-start justify-between pt-3">
                    {canGoBack ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("common:actions.back")}
                            onPress={() => router.back()}
                            hitSlop={8}
                            className="h-11 w-11 items-center justify-center rounded-[14px] border-b-[3px] border-[#e6dfdc] bg-white shadow-md shadow-black/10 active:opacity-80">
                            <ArrowLeft size={20} color={colors["text-dark"]} strokeWidth={2.2} style={flipInRTL} />
                        </Pressable>
                    ) : (
                        <View />
                    )}
                    <Animated.View entering={FadeIn.duration(600)} pointerEvents="none" accessible={false}>
                        <LanguageHero size={72} />
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
                    <Text
                        accessibilityRole="header"
                        maxFontSizeMultiplier={1.2}
                        className="mt-3 font-jakarta-extrabold text-text-dark"
                        style={{ fontSize: 29, lineHeight: 36, letterSpacing: -1 }}>
                        {t("picker.title")}
                    </Text>
                    <Text className="mt-2 font-jakarta text-[15px] leading-[21px] text-text-secondary-muted">
                        {t("picker.subtitle")}
                    </Text>

                    <View className="mt-6 flex-1">
                        <LanguagePicker selectedCode={selectedCode} onSelect={setSelectedCode} />
                    </View>
                </Animated.View>

                {/* 3D red "key" button, same as the register screen: darker bottom edge, sinks when pressed */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving, busy: saving }}
                    disabled={saving}
                    onPress={onContinue}
                    style={({ pressed }) => ({ transform: [{ translateY: pressed ? 2 : 0 }] })}
                    className="mb-2 mt-5 h-14 items-center justify-center overflow-hidden rounded-brand-12 border-b-4 border-primary-dark bg-primary shadow-lg shadow-primary/30">
                    <View pointerEvents="none" className="absolute inset-x-4 top-[3px] h-px bg-white/40" />
                    {saving ? (
                        <ActivityIndicator color={colors.surface} />
                    ) : (
                        <Text className="font-jakarta-semibold text-heading-h5 text-surface">
                            {t("common:actions.continue")}
                        </Text>
                    )}
                </Pressable>
            </SafeAreaView>
        </View>
    );
}
