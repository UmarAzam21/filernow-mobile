// nativeApp\src\features\language\components\language-row.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { AppLanguage, AppLanguageConfig } from "@/i18n/languages";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

/** Script sample shown as the row's icon; English gets a globe instead. */
const GLYPHS: Partial<Record<AppLanguage, string>> = {
    ur: "اردو",
    "ur-Latn": "Ur",
};

type Props = {
    language: AppLanguageConfig;
    selected: boolean;
    onPress: (code: AppLanguage) => void;
};

/** One language option: script glyph, name (native name under it when different), radio mark. */
export function LanguageRow({ language, selected, onPress }: Props) {
    const glyph = GLYPHS[language.code];

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${language.nativeName}, ${language.name}`}
            onPress={() => onPress(language.code)}
            className={cn(
                "min-h-[62px] flex-row items-center rounded-2xl border px-4",
                selected ? "border-primary bg-primary-tint" : "border-border-clr bg-white",
            )}>
            <View className="me-3 h-10 w-11 items-center justify-center">
                {glyph ? (
                    <Text className="font-jakarta-bold text-lg text-primary">{glyph}</Text>
                ) : (
                    <SymbolView
                        name={{ ios: "globe", android: "language", web: "language" }}
                        tintColor={colors.primary}
                        size={26}
                    />
                )}
            </View>

            <View className="me-3 flex-1">
                <Text className="font-jakarta-semibold text-[15px] text-text-dark">{language.name}</Text>
                {/* skip the native name when the glyph already shows it (اردو) */}
                {language.nativeName !== language.name && language.nativeName !== glyph ? (
                    <Text className="text-xs text-text-secondary">{language.nativeName}</Text>
                ) : null}
            </View>

            {/* radio ring */}
            <View
                className={cn(
                    "h-6 w-6 items-center justify-center rounded-full border-2",
                    selected ? "border-primary" : "border-border-strong",
                )}>
                {selected ? <View className="h-3 w-3 rounded-full bg-primary" /> : null}
            </View>
        </Pressable>
    );
}
