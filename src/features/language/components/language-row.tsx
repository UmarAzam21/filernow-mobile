// nativeApp\src\features\language\components\language-row.tsx

import type { LanguageCode } from "iso-639-1";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { Language } from "@/features/language/data/languages";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const CHECKED = { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" } as const;
const UNCHECKED = {
    ios: "circle",
    android: "radio_button_unchecked",
    web: "radio_button_unchecked",
} as const;

type Props = { language: Language; selected: boolean; onPress: (code: LanguageCode) => void };

export function LanguageRow({ language, selected, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onPress(language.code)}
            className={cn(
                "min-h-[58px] flex-row items-center rounded-2xl border px-4",
                selected ? "border-primary bg-primary-tint" : "border-border-clr bg-white",
            )}>
            <View
                className={cn(
                    "mr-3 h-9 w-9 items-center justify-center rounded-xl",
                    selected ? "bg-primary" : "bg-surface-muted",
                )}>
                <Text
                    className={cn(
                        "font-jakarta-bold text-xs",
                        selected ? "text-white" : "text-text-secondary",
                    )}>
                    {language.code.toUpperCase()}
                </Text>
            </View>

            <View className="mr-3 flex-1">
                <Text className="font-jakarta-semibold text-[15px] text-text-dark">
                    {language.nativeName || language.name}
                </Text>
                <Text className="font-jakarta text-xs text-text-secondary">{language.name}</Text>
            </View>

            <SymbolView
                name={selected ? CHECKED : UNCHECKED}
                tintColor={selected ? colors.primary : colors["border-strong"]}
                size={22}
            />
        </Pressable>
    );
}