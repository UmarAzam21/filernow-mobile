// nativeApp\src\features\language\screens\language-screen.tsx

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { LanguageCode } from "iso-639-1";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { images } from "@/constants/images";
import { LanguageSheet } from "@/features/language/components/language-sheet";
import { MoreLanguagesButton } from "@/features/language/components/more-languages-button";
import { PopularLanguages } from "@/features/language/components/popular-languages";
import { getLanguage, isFeaturedLanguage } from "@/features/language/data/languages";
import { colors } from "@/theme/tokens";
import { useAppStore } from "@/stores/app-store";

export default function LanguageScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const storedLanguage = useAppStore((s) => s.language);
    const setLanguage = useAppStore((s) => s.setLanguage);
    const completeOnboarding = useAppStore((s) => s.completeOnboarding);
    const [selectedCode, setSelectedCode] = useState<LanguageCode>(storedLanguage);
    const [sheetOpen, setSheetOpen] = useState(false);

    const selected = getLanguage(selectedCode);

    return (
        // top only: the white card runs to the bottom edge and handles the bottom inset itself
        <SafeAreaView edges={["top"]} className="flex-1">
            <StatusBar style="light" />
            <Image
                source={images.welcomeBg}
                contentFit="cover"
                accessibilityLabel="Welcome background"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View className="flex-row items-center justify-between px-6 pb-5 pt-2">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => router.back()}
                    className="h-10 w-10 items-start justify-center">
                    <SymbolView
                        name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
                        tintColor={colors["text-dark"]}
                        size={22}
                    />
                </Pressable>
                <Text className="font-jakarta-bold text-xl text-primary">Filernow</Text>
            </View>

            <View className="flex-1 items-center justify-center px-8">
                <Image
                    source={images.languageGlobe}
                    contentFit="contain"
                    accessibilityLabel="Multilingual globe illustration"
                    style={{ width: "90%", height: "90%" }}
                />
            </View>

            <View className="mt-auto">
                {/* floating globe badge, half on the card */}
                <View className="z-10 -mb-8 ml-6 h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary">
                    <SymbolView
                        name={{ ios: "globe", android: "language", web: "language" }}
                        tintColor="#FFFFFF"
                        size={28}
                    />
                </View>

                <View
                    style={{ paddingBottom: insets.bottom + 16 }}
                    className="rounded-t-brand-32 bg-white px-6 pt-12">
                    <Text className="font-jakarta-extrabold text-[25px] text-text-dark">
                        Choose Your <Text className="text-primary">Language</Text>
                    </Text>

                    <PopularLanguages selectedCode={selectedCode} onSelect={setSelectedCode} />

                    {isFeaturedLanguage(selectedCode) ? null : (
                        <Text className="mt-3 font-jakarta-medium text-sm text-text-secondary">
                            Selected: {selected.nativeName || selected.name}
                        </Text>
                    )}

                    <MoreLanguagesButton onPress={() => setSheetOpen(true)} />

                    <PrimaryButton
                        label="Continue"
                        className="mt-5"
                        onPress={() => {
                            setLanguage(selectedCode);
                            completeOnboarding();
                            // router.replace("/home");
                            router.replace("/register");
                        }}
                    />
                </View>
            </View>

            <LanguageSheet
                visible={sheetOpen}
                selectedCode={selectedCode}
                onSelect={setSelectedCode}
                onClose={() => setSheetOpen(false)}
            />
        </SafeAreaView>
    );
}