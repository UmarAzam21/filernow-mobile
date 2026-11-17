// nativeApp\src\features\language\screens\language-screen.tsx

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { LanguageHero } from "@/features/language/components/language-hero";
import { LanguagePicker, PICKER_BLUE } from "@/features/language/components/language-picker";
import { switchLanguage } from "@/features/language/lib/switch-language";
import { flipInRTL, needsDirectionChange } from "@/i18n/direction";
import type { AppLanguage } from "@/i18n/languages";
import { useAppStore } from "@/stores/app-store";

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
        <View className="flex-1 bg-white">
            <SkyGradient />
            <StatusBar style="dark" />

            <SafeAreaView edges={["top", "bottom"]} className="flex-1 px-5">
                {/* top row: back button left, globe art right. In the layout flow (not absolute) so the
                    title always starts below the art and can't collide with it on any screen size */}
                <View className="flex-row items-start justify-between pt-2">
                    {canGoBack ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("common:actions.back")}
                            onPress={() => router.back()}
                            hitSlop={8}
                            className="h-11 w-11 items-center justify-center rounded-full border border-white bg-white/50">
                            <View style={flipInRTL}>
                                <SymbolView
                                    name={{ ios: "chevron.left", android: "arrow_back_ios_new", web: "arrow_back_ios_new" }}
                                    tintColor="#2B2B2B"
                                    size={16}
                                />
                            </View>
                        </Pressable>
                    ) : (
                        <View />
                    )}
                    <Animated.View entering={FadeIn.duration(600)} pointerEvents="none" style={{ marginEnd: -8 }}>
                        <LanguageHero width={170} />
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
                    <Text className="mt-3 font-jakarta-semibold text-[24px] leading-[32px] text-[#1F2937]">
                        {t("picker.title")}
                    </Text>
                    <Text className="mt-1.5 font-jakarta text-para-base text-[#6B7280]">{t("picker.subtitle")}</Text>

                    <View className="mt-7 flex-1">
                        <LanguagePicker selectedCode={selectedCode} onSelect={setSelectedCode} />
                    </View>
                </Animated.View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving, busy: saving }}
                    disabled={saving}
                    onPress={onContinue}
                    style={{ backgroundColor: PICKER_BLUE.accent, opacity: saving ? 0.7 : 1 }}
                    className="mb-2 mt-4 h-14 items-center justify-center rounded-full active:opacity-80">
                    <Text className="font-jakarta-medium text-[17px] text-white">{t("common:actions.continue")}</Text>
                </Pressable>
            </SafeAreaView>
        </View>
    );
}

/**
 * Sky blue (#7CC6FE) wash that fades to white about two-thirds down, plus a soft diagonal
 * sheen across the top-left corner, as in the mockup.
 */
function SkyGradient() {
    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: "30%" }]}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <Defs>
                    <LinearGradient id="langSky" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={PICKER_BLUE.sky} stopOpacity={0.6} />
                        <Stop offset="0.55" stopColor={PICKER_BLUE.sky} stopOpacity={0.22} />
                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                    </LinearGradient>
                    <LinearGradient id="langSheen" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                    </LinearGradient>
                </Defs>
                <Rect width="100" height="100" fill="url(#langSky)" />
                <Path d="M0 0 H62 L0 22 Z" fill="url(#langSheen)" />
            </Svg>
        </View>
    );
}
