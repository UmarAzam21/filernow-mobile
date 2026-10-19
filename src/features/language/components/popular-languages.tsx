// nativeApp\src\features\language\components\popular-languages.tsx

import type { LanguageCode } from "iso-639-1";
import { Pressable, Text, View } from "react-native";

import { POPULAR } from "@/features/language/data/languages";
import { cn } from "@/lib/cn";

type Props = { selectedCode: LanguageCode; onSelect: (code: LanguageCode) => void };

export function PopularLanguages({ selectedCode, onSelect }: Props) {
    return (
        <>
            <Text className="mb-3 mt-5 font-jakarta-semibold text-sm text-text-secondary">
                Popular languages
            </Text>
            <View className="flex-row flex-wrap gap-2">
                {POPULAR.map((language) => {
                    const selected = language.code === selectedCode;
                    return (
                        <Pressable
                            key={language.code}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            onPress={() => onSelect(language.code)}
                            className={cn(
                                "flex-row items-center rounded-full border px-3 py-2",
                                selected ? "border-primary bg-primary-tint" : "border-border-clr bg-white",
                            )}>
                            <Text
                                className={cn(
                                    "mr-2 font-jakarta-bold text-xs",
                                    selected ? "text-primary" : "text-text-secondary",
                                )}>
                                {language.code.toUpperCase()}
                            </Text>
                            <Text className="font-jakarta-semibold text-sm text-text-dark">
                                {language.nativeName || language.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </>
    );
}