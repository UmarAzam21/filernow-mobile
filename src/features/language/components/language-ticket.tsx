// nativeApp\src\features\language\components\language-ticket.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { Language } from "@/features/language/data/languages";
import { colors } from "@/theme/tokens";

const DASHES = Array.from({ length: 26 }, (_, i) => i);

type Props = { language: Language; onPress: () => void };

export function LanguageTicket({ language, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Language, ${language.name}. Tap to change`}
            onPress={onPress}
            className="mt-6 rounded-2xl border border-primary bg-primary-tint active:opacity-80">
            <View className="flex-row items-center justify-between px-5 pb-4 pt-4">
                <View className="mr-3 flex-1">
                    <Text className="font-jakarta-bold text-[10px] uppercase tracking-widest text-text-secondary">
                        App language
                    </Text>
                    <Text className="mt-1 font-jakarta-extrabold text-[26px] text-text-dark" numberOfLines={1}>
                        {language.nativeName || language.name}
                    </Text>
                    <Text className="font-jakarta text-xs text-text-secondary">{language.name}</Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                    <Text className="font-jakarta-bold text-sm text-white">{language.code.toUpperCase()}</Text>
                </View>
            </View>

            {/* dashed tear line with notches */}
            <View className="h-5 justify-center">
                <View className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-white" />
                <View className="absolute -right-[11px] top-0 h-5 w-5 rounded-full bg-white" />
                <View className="flex-row items-center justify-between px-5">
                    {DASHES.map((i) => (
                        <View key={i} className="h-px w-2 bg-primary-light" />
                    ))}
                </View>
            </View>

            <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
                <Text className="font-jakarta-semibold text-xs text-text-secondary">Tap to change language</Text>
                <SymbolView
                    name={{ ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" }}
                    tintColor={colors.primary}
                    size={18}
                />
            </View>
        </Pressable>
    );
}