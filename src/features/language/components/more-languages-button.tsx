// nativeApp\src\features\language\components\more-languages-button.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text } from "react-native";

import { languages } from "@/features/language/data/languages";
import { colors } from "@/theme/tokens";

export function MoreLanguagesButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Browse all languages"
            onPress={onPress}
            className="mt-3 min-h-12 flex-row items-center rounded-2xl border border-border-clr bg-white px-4 active:opacity-80">
            <SymbolView
                name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                tintColor={colors["text-secondary"]}
                size={18}
            />
            <Text className="ml-3 flex-1 font-jakarta-semibold text-base text-text-dark">More languages</Text>
            <Text className="font-jakarta-medium text-sm text-text-secondary">{languages.length} available</Text>
            <SymbolView
                name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
                tintColor={colors["text-secondary"]}
                size={18}
            />
        </Pressable>
    );
}